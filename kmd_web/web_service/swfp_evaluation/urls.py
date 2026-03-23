from django.urls import path
from .views import get_quarterly_report, get_event_table
from .get_event_table_data import get_event_table_data

urlpatterns = [
    path("reports/quarterly/", get_quarterly_report, name='quarterly-report'),
    path("events-table/", get_event_table, name='event-table'),
    path("events-table-data/", get_event_table_data, name='event-table-data')
]