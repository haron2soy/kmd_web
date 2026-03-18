from django.urls import path
from .views import get_quarterly_report, get_event_table

urlpatterns = [
    path("reports/quarterly/", get_quarterly_report, name='quarterly-report'),
    path("events-table/", get_event_table, name='event-table'),
]