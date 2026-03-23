from rest_framework import serializers
from .models import News, Announcement
from .alerts_models import Warning
from .event_models import Event

class NewsSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "published_at",
            "is_published",
            "author",
            "image_url",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "slug",
            "message",
            "start_at",
            "end_at",
            "is_active",
            "priority",
        ]

class WarningSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Warning
        fields = [
            "id",
            "title",
            "slug",
            "warning_type",
            "message",
            "start_at",
            "end_at",
            "is_active",
            "priority",
            "icon",
            "color",
        ]


class EventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "location",
            "start_date",
            "end_date",
            "is_active",
        ]