from rest_framework import serializers

from .models import Project


ALLOWED_GEOJSON_TYPES = {
    "Feature",
    "FeatureCollection",
    "Point",
    "Polygon",
    "MultiPolygon",
}


class ProjectSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "created_by",
            "created_by_username",
            "title",
            "slug",
            "short_description",
            "full_description",
            "geojson",
            "main_image",
            "is_published",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "created_by_username", "created_at", "updated_at")

    def validate_geojson(self, value):
        if value in (None, {}):
            return value
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "GeoJSON \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c JSON-\u043e\u0431\u044a\u0435\u043a\u0442\u043e\u043c."
            )
        geojson_type = value.get("type")
        if geojson_type not in ALLOWED_GEOJSON_TYPES:
            raise serializers.ValidationError(
                "\u0422\u0438\u043f GeoJSON \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043e\u0434\u043d\u0438\u043c \u0438\u0437: Feature, FeatureCollection, Point, Polygon \u0438\u043b\u0438 MultiPolygon."
            )
        return value
