from django.urls import path
from .views import HomeDetailView, HomeListView
from .views import health

urlpatterns = [
    path("home/", HomeListView.as_view(), name="home-list"),
    path("home/<slug:slug>/", HomeDetailView.as_view(), name="home-detail"),
    path("health/", health, name="health"),
]
