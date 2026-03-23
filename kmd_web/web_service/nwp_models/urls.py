# nwp_models/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Serve generated WRF image (PNG)
    path("notify/", views.notify_new_wrf,
     name="notify-wrf"),
     
    path("<str:model_name>/field/", views.get_model_field,
     name="wrf-field"),

    path("metadata/", views.get_wrf_metadata,
     name="wrf-metadata"),
    
    path("list-models/", views.list_models, name="list_models"),
]
