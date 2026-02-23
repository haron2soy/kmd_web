# forecasts/urls.py
from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .views import latest_forecast
from .doc_views import guidance_documents
from .archive_views import list_years, list_months, list_days, list_files, archive_files  # Added archive_files

app_name = "forecasts"

urlpatterns = [
    path("latest/", latest_forecast, name="latest-forecast"),  # Images ?day=1
    path('latest-doc/', guidance_documents, name='latest-document'),  # Docs ?slug=short-discussion
    path("archive/years/", list_years, name="archive-years"),
    path("archive/months/", list_months, name="archive-months"),
    path("archive/days/", list_days, name="archive-days"),
    path("archive/files/", list_files, name="archive-files"),  # OLD: all files
    path("archive/filtered-files/", archive_files, name="archive-filtered-files"),  # NEW: type-filtered files
]
