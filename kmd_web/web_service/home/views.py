from django.shortcuts import render

from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import AllowAny
from django.http import JsonResponse

from .models import Home
from .serializers import HomeSerializer
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Page

class HomeDetailView(RetrieveAPIView):
    serializer_class = HomeSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Home.objects.filter(is_published=True)


class HomeListView(ListAPIView):
    serializer_class = HomeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Home.objects.filter(is_published=True)

def health(request):
    return JsonResponse({"status": "ok"})


