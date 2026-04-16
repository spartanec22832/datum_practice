from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from .models import Card, CardMedia, Section


class CardMediaSerializer(serializers.ModelSerializer):
    card = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = CardMedia
        fields = (
            "id",
            "card",
            "file",
            "media_type",
            "caption",
            "sort_order",
            "created_at",
        )
        read_only_fields = ("id", "card", "media_type", "created_at")

class CardReadSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    section_slug = serializers.CharField(source="section.slug", read_only=True)
    media_items = CardMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Card
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "section",
            "section_slug",
            "author",
            "author_username",
            "main_image",
            "is_published",
            "media_items",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "author",
            "author_username",
            "section_slug",
            "media_items",
            "created_at",
            "updated_at",
        )


class CardWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = (
            "id",
            "title",
            "summary",
            "content",
            "section",
            "is_published",
        )
        read_only_fields = ("id",)


class SectionSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    children_count = serializers.SerializerMethodField()
    cards_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "parent",
            "author",
            "author_username",
            "sort_order",
            "is_published",
            "is_system",
            "children_count",
            "cards_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "author", "author_username", "created_at", "updated_at")

    def get_children_count(self, obj) -> int:
        return obj.children.count()

    def get_cards_count(self, obj) -> int:
        return obj.cards.count()

    def validate_is_system(self, value):
        request = self.context.get("request")
        if request and request.user.is_authenticated and request.user.is_staff:
            return value
        if "is_system" in getattr(self, "initial_data", {}):
            raise serializers.ValidationError("Only admin can manage system sections.")
        return value


class CardSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    section_slug = serializers.CharField(source="section.slug", read_only=True)
    media_items = CardMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Card
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "section",
            "section_slug",
            "author",
            "author_username",
            "main_image",
            "is_published",
            "media_items",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "author", "author_username", "section_slug", "created_at", "updated_at")


class SectionContentSerializer(SectionSerializer):
    child_sections = serializers.SerializerMethodField()
    cards = serializers.SerializerMethodField()

    class Meta(SectionSerializer.Meta):
        fields = SectionSerializer.Meta.fields + ("child_sections", "cards")

    def _filter_sections(self, queryset):
        request = self.context["request"]
        user = request.user
        if user.is_authenticated and user.is_staff:
            return queryset
        if user.is_authenticated:
            return (queryset.filter(is_published=True) | queryset.filter(author=user)).distinct()
        return queryset.filter(is_published=True)

    def _filter_cards(self, queryset):
        request = self.context["request"]
        user = request.user
        if user.is_authenticated and user.is_staff:
            return queryset
        if user.is_authenticated:
            return (queryset.filter(is_published=True) | queryset.filter(author=user)).distinct()
        return queryset.filter(is_published=True)

    @extend_schema_field(SectionSerializer(many=True))
    def get_child_sections(self, obj):
        queryset = self._filter_sections(obj.children.all())
        return SectionSerializer(queryset, many=True, context=self.context).data

    @extend_schema_field(CardReadSerializer(many=True))
    def get_cards(self, obj):
        queryset = self._filter_cards(obj.cards.all())
        return CardReadSerializer(queryset, many=True, context=self.context).data