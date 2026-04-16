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
            raise serializers.ValidationError("GeoJSON must be an object.")
        geojson_type = value.get("type")
        if geojson_type not in ALLOWED_GEOJSON_TYPES:
            raise serializers.ValidationError(
                "GeoJSON type must be one of Feature, FeatureCollection, Point, Polygon, or MultiPolygon."
            )
        return value
