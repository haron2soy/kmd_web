# nwp_models/urls.py
from django.urls import path
from . import views
from . import tiles

urlpatterns = [
    # GeoData grid endpoint (your original)
    path("wrf/", views.GeoDataView.as_view(), name="geodata-grid"),
    
    # Tile serving endpoints
    path(
        "wrf/<str:variable>/<int:z>/<int:x>/<int:y>.png",
        tiles.tile_view,
        name="wrf-tile",
    ),
    
    # Metadata endpoint
    path('metadata/', 
         tiles.metadata_view, name='wrf-metadata'),
    
    # Original API endpoints
    path('layers/', 
         views.available_layers, name='wrf-layers'),
    path('layer/<str:variable>/', 
         views.get_layer, name='wrf-layer'),
]