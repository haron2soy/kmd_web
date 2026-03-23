from django.shortcuts import render

# Create your views here.
from rest_framework.generics import RetrieveAPIView
from .models import Page
from .serializers import PageSerializer

class PageDetailView(RetrieveAPIView):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = "slug"


