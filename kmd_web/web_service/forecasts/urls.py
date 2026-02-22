# forecasts/urls.py

from django.urls import path
from .views import latest_forecast

app_name = "forecasts"

urlpatterns = [
    path("latest/", latest_forecast, name="latest-forecast"),
]