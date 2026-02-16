# nwp_models/views.py
"""
API endpoints for WRF visualization (scalable for large files)
Serves Cloud-Optimized GeoTIFFs (COGs) and tile URLs instead of full arrays.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings

from .services.wrf_to_cog import generate_cog
from .services.tiling import build_tile_url
from .services.cache import get_or_set

'''WRF_FILE = "data/wrfout.nc"
BASE_URL = "http://localhost:8000/media/cog/"'''


@api_view(["GET"])
def available_layers(request):
    """
    List all available WRF layers for visualization
    """
    return Response({
        "layers": ["precip", "t2"]
    })


@api_view(["GET"])
def get_layer(request, variable: str):
    """
    Returns tile URLs for a WRF variable
    """
    cache_key = f"wrf:{variable}"

    def compute():
        # Convert WRF variable to a COG if not already exists
        cog_path = generate_cog(WRF_FILE, variable)

        # Build XYZ tile endpoint for frontend (deck.gl / Mapbox)
        tile_url = build_tile_url(cog_path)
        return {"variable": variable, "tile_url": tile_url}

    data = get_or_set(cache_key, compute, timeout=1800)
    return Response(data)


class GeoDataView(APIView):
    """
    Handles on-demand GeoData requests (e.g., downsampled previews or metadata)
    Instead of returning full arrays, return small preview or stats
    """

    def get(self, request):
        from .serializers import GeoDataRequestSerializer
        serializer = GeoDataRequestSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data

        cache_key = f"wrf_preview:{params['variable']}:{params.get('time_index',0)}"

        def fetch_preview():
            """
            ⚡ IMPORTANT:
            Only return small preview or metadata, not full array!
            """
            from .services.netcdf import extract_variable
            return extract_variable(
                params["file"],
                params["variable"],
                params.get("time_index", 0),
                downsample=10  # 10x downsample to reduce memory usage
            )

        data = get_or_set(cache_key, fetch_preview, timeout=1800)
        return Response(data)
