from django.urls import path
from .views import HomeDetailView, HomeListView
from .views import health, page_detail

urlpatterns = [
    path("home/", HomeListView.as_view(), name="home-list"),
    path("home/<slug:slug>/", HomeDetailView.as_view(), name="home-detail"),
    path("health/", health, name="health"),
    #path("pages/<slug:slug>/", page_detail),
]
