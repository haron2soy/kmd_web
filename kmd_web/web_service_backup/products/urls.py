# products.urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('noaa-ncep/', views.noaa_redirect, name='noaa_redirect'),
]
