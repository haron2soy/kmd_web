#nwp_models/urls.py
from django.urls import path
#from .views import wrf_field
from .views import GeoDataView
from .tiles import tile_view

urlpatterns = [
    #path("nwp-models/field/", wrf_field, name="wrf_field"),
    #path("layers/", views.available_layers),
    #path("layer/<str:variable>/", views.get_layer),
    path("wrf/", GeoDataView.as_view(), name="geodata-grid"),
    path(
        "wrf/<str:variable>/<int:z>/<int:x>/<int:y>.png",
        tile_view,
        name="wrf-tile",
    ),
]
