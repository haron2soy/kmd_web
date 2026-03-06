from rest_framework import generics
from .alerts_models import Warning
from .serializers import WarningSerializer
from django.utils import timezone
from django.db import models

class ActiveWarningList(generics.ListAPIView):
    """
    Returns all currently active warnings.
    """
    serializer_class = WarningSerializer

    def get_queryset(self):
        now = timezone.now()
        return Warning.objects.filter(
            is_active=True
        ).filter(
            start_at__lte=now
        ).filter(
            models.Q(end_at__gte=now) | models.Q(end_at__isnull=True)
        ).order_by("-priority", "-start_at")