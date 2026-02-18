# nwp_models/views.py

"""
CONTROL PLANE (Django)

- Provides metadata
- Provides tile URLs
- NEVER touches NetCDF
- NEVER proxies raw arrays
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response


# -----------------------------------
# AVAILABLE VARIABLES
# -----------------------------------
@api_view(["GET"])
def available_layers(request):
    return Response({
        "layers": [
            "T2",
            "U10",
            "V10",
            "RAINNC"
        ]
    })


# -----------------------------------
# AVAILABLE DATASETS (OPTIONAL)
# -----------------------------------
@api_view(["GET"])
def available_datasets(request):
    return Response({
        "datasets": [
            "2026-02-11_12:00:00",
        ]
    })


# -----------------------------------
# TILE URL PROVIDER (NO PROCESSING)
# -----------------------------------
@api_view(["GET"])
def get_layer(request, variable: str):
    """
    Returns tile URL template for frontend
    """

    file = request.GET.get("file")
    time_index = request.GET.get("time_index", 0)

    if not file:
        return Response({"error": "Missing file"}, status=400)

    tile_url = (
        f"/api/wrf/tiles/{variable}/{{z}}/{{x}}/{{y}}.png"
        f"?file={file}&time_index={time_index}"
    )

    return Response({
        "variable": variable,
        "tile_url": tile_url
    })