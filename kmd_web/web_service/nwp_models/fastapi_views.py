# nwp_models/fastapi_views.py

"""
Django → FastAPI proxy (CONTROL PLANE)

Responsibilities:
- Validate incoming requests
- Optional authentication / authorization
- Forward requests to FastAPI
- Return raw binary payload unchanged
- Forward metadata headers

This module MUST NOT:
- Read NetCDF files
- Use numpy / xarray
- Apply colormaps
- Understand tiles or geography
"""

import requests
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET

FASTAPI_BASE_URL = "http://127.0.0.1:8001"


@require_GET
def wrf_field(request):
    """
    Endpoint:
      /api/wrf/field/?datetime=YYYY-MM-DDTHH:MM&variable=T2

    Returns:
      - Raw binary array (float32)
      - Metadata via HTTP headers
    """

    # -------------------------
    # Validate query parameters
    # -------------------------
    datetime = request.GET.get("datetime")
    variable = request.GET.get("variable", "T2")

    if not datetime:
        return JsonResponse(
            {"error": "Missing required parameter: datetime"},
            status=400
        )

    # -------------------------
    # Optional authentication
    # -------------------------
    # if not request.user.is_authenticated:
    #     return JsonResponse({"error": "Unauthorized"}, status=401)

    # -------------------------
    # Proxy request to FastAPI
    # -------------------------
    try:
        upstream = requests.get(
            f"{FASTAPI_BASE_URL}/field",
            params={
                "datetime": datetime,
                "variable": variable,
            },
            timeout=20,
        )
    except requests.exceptions.RequestException:
        return JsonResponse(
            {"error": "FastAPI service unavailable"},
            status=502
        )

    # -------------------------
    # Handle upstream errors
    # -------------------------
    if upstream.status_code != 200:
        try:
            return JsonResponse(
                upstream.json(),
                status=upstream.status_code
            )
        except ValueError:
            return JsonResponse(
                {"error": "Upstream FastAPI error"},
                status=upstream.status_code
            )

    # -------------------------
    # Return raw binary response
    # -------------------------
    response = HttpResponse(
        upstream.content,
        content_type="application/octet-stream",
    )

    # -------------------------
    # Forward metadata headers
    # -------------------------
    for header in ("X-Shape", "X-Dtype", "X-Variable"):
        if header in upstream.headers:
            response[header] = upstream.headers[header]

    return response