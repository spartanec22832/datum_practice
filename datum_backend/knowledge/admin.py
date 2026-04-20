from django.contrib import admin
from .models import Card, CardMedia, Section


class CardMediaInline(admin.TabularInline):
    model = CardMedia
    extra = 1
    fields = ("file", "caption", "sort_order")
    verbose_name = "Вложение"
    verbose_name_plural = "Вложения карточки"


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "author", "sort_order", "is_published", "is_system")
    list_filter = ("is_published", "is_system", "author", "created_at", "updated_at")
    search_fields = ("title", "description", "author__username")
    autocomplete_fields = ("parent", "author")
    readonly_fields = ("slug", "created_at", "updated_at")
    fields = (
        "title",
        "description",
        "parent",
        "author",
        "sort_order",
        "is_published",
        "is_system",
        "slug",
        "created_at",
        "updated_at",
    )

    def save_model(self, request, obj, form, change):
        if not change and not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("title", "section", "author", "is_published", "created_at")
    list_filter = ("is_published", "section", "author", "created_at", "updated_at")
    search_fields = ("title", "summary", "content", "author__username")
    autocomplete_fields = ("section", "author")
    readonly_fields = ("slug", "created_at", "updated_at")
    inlines = (CardMediaInline,)

    fieldsets = (
        ("Основное", {
            "fields": ("title", "summary", "content", "section", "author", "is_published")
        }),
        ("Главное фото карточки", {
            "fields": ("main_image",),
            "description": "Сюда загружается только одно главное изображение карточки.",
        }),
        ("Служебные поля", {
            "fields": ("slug", "created_at", "updated_at"),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change and not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)