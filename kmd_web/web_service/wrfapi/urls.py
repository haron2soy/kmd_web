from django.urls import path
from .views import get_field

urlpatterns = [
    path("field", get_field),
]
