# nwp_models/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Serve generated WRF image (PNG)
    path("notify/", views.notify_new_wrf,
     name="notify-wrf"),
     
    path("field/", views.get_wrf_field,
     name="wrf-field"),

    path("metadata/", views.get_wrf_metadata,
     name="wrf-metadata"),  # add this
]
