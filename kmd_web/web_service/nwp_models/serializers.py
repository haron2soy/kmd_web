# nwp_models/serializers.py
from rest_framework import serializers

class LayerSerializer(serializers.Serializer):
    variable = serializers.CharField()
    tile_url = serializers.CharField()
# DRF serializer

class GeoDataRequestSerializer(serializers.Serializer):
    file = serializers.CharField()
    variable = serializers.CharField()
    time_index = serializers.IntegerField(default=0)
