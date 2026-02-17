#nwp_models/urls.py
from django.urls import path
from . import views
from .tiles import tile_view, metadata_view
from .fastapi_views import wrf_field
urlpatterns = [
    # -------------------------------
    # CONTROL PLANE (Django-owned)
    # -------------------------------

    # Metadata (can stay in Django OR proxy to FastAPI later)
    path(
        "metadata/",
        metadata_view,
        name="wrf-metadata"
    ),

    # Available layers (UI support)
    path(
        "layers/",
        views.available_layers,
        name="wrf-layers"
    ),

    # Layer request (SHOULD proxy FastAPI now ⚠️)
    path(
        "layer/<str:variable>/",
        views.get_layer,
        name="wrf-layer"
    ),

    # -------------------------------
    # TILE API (Django gateway)
    # -------------------------------
    path(
        "tiles/<str:variable>/<int:z>/<int:x>/<int:y>.png",
        tile_view,
        name="wrf-tile"
    ),

    # -------------------------------
    # OPTIONAL (LEGACY / DEBUG)
    # -------------------------------
    path(
        "wrf/",
        views.GeoDataView.as_view(),
        name="geodata-grid"
    ),

     
     path(
          "field/", 
          wrf_field, 
          name="field"
     ),
]