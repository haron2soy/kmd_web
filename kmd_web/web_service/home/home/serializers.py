from rest_framework import serializers
from .models import Home

class HomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Home
        fields = [
            "slug",
            "title",
            "content",
            "created_at",
            "updated_at",
        ]
