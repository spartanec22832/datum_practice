from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "is_published", "created_at")
    list_filter = ("is_published", "created_at", "updated_at")
    search_fields = ("title", "short_description", "full_description")
    autocomplete_fields = ("created_by",)
    readonly_fields = ("slug", "created_at", "updated_at")
    fields = (
        "title",
        "short_description",
        "full_description",
        "geojson",
        "main_image",
        "created_by",
        "is_published",
        "slug",
        "created_at",
        "updated_at",
    )