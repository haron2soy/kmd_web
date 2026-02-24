from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q

from .models import News, Announcement
from .serializers import NewsSerializer, AnnouncementSerializer


# -------------------
# NEWS VIEWS
# -------------------

class NewsListView(ListAPIView):
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            News.objects
            .filter(is_published=True)
            .order_by("-published_at")
        )


class NewsDetailView(RetrieveAPIView):
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return News.objects.filter(is_published=True)


# -------------------
# ANNOUNCEMENT VIEWS
# -------------------

class ActiveAnnouncementListView(ListAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        now = timezone.now()

        return (
            Announcement.objects
            .filter(is_active=True, start_at__lte=now)
            .filter(Q(end_at__gte=now) | Q(end_at__isnull=True))
            .order_by("-priority", "-start_at")
        )

class ActiveAnnouncementDetailView(RetrieveAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Announcement.objects.filter(is_published=True)