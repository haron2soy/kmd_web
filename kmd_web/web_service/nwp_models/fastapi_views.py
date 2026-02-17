#nwp_models/fastapi_views.py
import requests
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET

FASTAPI_URL = "http://127.0.0.1:8001/"


@require_GET
def wrf_field(request):
    """
    Django endpoint:
    /api/wrf/field/?datetime=...&variable=T2

    Role:
    - validation
    - auth (optional)
    - proxy to FastAPI
    """

    datetime = request.GET.get("datetime")
    variable = request.GET.get("variable", "T2")

    # -------------------------
    # Validate request
    # -------------------------
    if not datetime:
        return JsonResponse({"error": "Missing datetime"}, status=400)

    # -------------------------
    # OPTIONAL: Auth layer
    # -------------------------
    # if not request.user.is_authenticated:
    #     return JsonResponse({"error": "Unauthorized"}, status=401)

    try:
        resp = requests.get(
            f"{FASTAPI_URL}/field",
            params={"datetime": datetime, "variable": variable},
            timeout=15
        )
    except requests.exceptions.RequestException:
        return JsonResponse({"error": "FastAPI unavailable"}, status=502)

    # -------------------------
    # Handle errors
    # -------------------------
    if resp.status_code != 200:
        try:
            return JsonResponse(resp.json(), status=resp.status_code)
        except Exception:
            return JsonResponse({"error": "Upstream error"}, status=resp.status_code)

    # -------------------------
    # Return binary data
    # -------------------------
    response = HttpResponse(
        resp.content,
        content_type="application/octet-stream"
    )

    # Forward metadata headers
    response["X-Shape"] = resp.headers.get("X-Shape", "")
    response["X-Dtype"] = resp.headers.get("X-Dtype", "")
    response["X-Variable"] = resp.headers.get("X-Variable", variable)

    return response
