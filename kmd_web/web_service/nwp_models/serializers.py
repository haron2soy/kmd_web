class GeoDataRequestSerializer(serializers.Serializer):
    file = serializers.CharField()
    variable = serializers.ChoiceField(
        choices=["T2", "PRECIP", "RH", "U10", "V10"]
    )
    time_index = serializers.IntegerField(default=0, min_value=0)
