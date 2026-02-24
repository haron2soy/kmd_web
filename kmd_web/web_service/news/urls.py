from django.urls import path
from .views import (
    NewsListView,
    NewsDetailView,
    ActiveAnnouncementListView,
    ActiveAnnouncementDetailView
)

urlpatterns = [
    # News
    path("news/", NewsListView.as_view(), name="news-list"),
    path("news/<slug:slug>/", NewsDetailView.as_view(), name="news-detail"),

    # Announcements
    path("announcements/active/", ActiveAnnouncementListView.as_view(), name="active-announcements"),
    path("announcements/active/<slug:slug>/", ActiveAnnouncementDetailView.as_view(), name="active-announcements-detail"),
]