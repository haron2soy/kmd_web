# nwp_models/views.py

"""
CONTROL PLANE (Django)

- Provides metadata
- Provides tile endpoints
- Proxies FastAPI (data plane)
- DOES NOT touch NetCDF directly
"""

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.conf import settings

from .services.cache import get_or_set


# -----------------------------------
# CONFIG
# -----------------------------------
FASTAPI_URL = "http://127.0.0.1:8001"


# -----------------------------------
# AVAILABLE LAYERS
# -----------------------------------
@api_view(["GET"])
def available_layers(request):
    return Response({
        "layers": [
            "T2",
            "PRECIP",
            "RH",
            "U10",
            "V10"
        ]
    })


# -----------------------------------
# TILE URL PROVIDER (NO PROCESSING)
# -----------------------------------
@api_view(["GET"])
def get_layer(request, variable: str):
    """
    Returns tile URL for frontend map
    Example:
    /api/wrf/layer/T2?file=wrfout_d01_2026-02-11_12:00:00
    """

    file = request.GET.get("file")
    time_index = request.GET.get("time_index", 0)

    if not file:
        return Response({"error": "Missing file"}, status=400)

    # Build Django tile endpoint (NOT FastAPI)
    tile_url = (
        f"/api/wrf/tiles/{variable}/{{z}}/{{x}}/{{y}}.png"
        f"?file={file}&time_index={time_index}"
    )

    return Response({
        "variable": variable,
        "tile_url": tile_url
    })


# -----------------------------------
# FASTAPI PROXY (RAW FIELD)
# -----------------------------------
@api_view(["GET"])
def field_proxy(request):
    """
    Proxy raw binary data from FastAPI
    """

    file = request.GET.get("file")
    variable = request.GET.get("variable", "T2")
    time_index = request.GET.get("time_index", 0)

    if not file:
        return Response({"error": "Missing file"}, status=400)

    try:
        resp = requests.get(
            f"{FASTAPI_URL}/field",
            params={
                "file": file,
                "variable": variable,
                "time_index": time_index
            },
            timeout=30
        )

        if resp.status_code != 200:
            return Response({"error": "FastAPI error"}, status=502)

        return Response({
            "size_bytes": len(resp.content),
            "dtype": "float32"
        })

    except requests.exceptions.RequestException:
        return Response({"error": "FastAPI unavailable"}, status=502)


# -----------------------------------
# LIGHTWEIGHT PREVIEW (OPTIONAL)
# -----------------------------------
class GeoDataView(APIView):
    """
    Only metadata / preview — NEVER full arrays
    """

    def get(self, request):

        variable = request.GET.get("variable", "T2")

        cache_key = f"wrf:preview:{variable}"

        def fetch():
            try:
                resp = requests.get(
                    f"{FASTAPI_URL}/field",
                    params={
                        "variable": variable
                    },
                    timeout=10
                )

                return {
                    "status": "ok",
                    "size_bytes": len(resp.content)
                }

            except:
                return {"error": "FastAPI unavailable"}

        data = get_or_set(cache_key, fetch, timeout=600)
        return Response(data)
