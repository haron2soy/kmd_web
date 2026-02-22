# forecasts/urls.py

from django.urls import path
from .views import latest_forecast
from .doc_views import guidance_documents

app_name = "forecasts"

urlpatterns = [
    path("latest/", latest_forecast, name="latest-forecast"),
        # document endpoint
    path('latest-doc/', guidance_documents, name='latest-document'),
]