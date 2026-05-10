import re
import os
from django.conf import settings
from django.db import models
from slugify import slugify


def normalize_title(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())

def build_transliterated_slug(value: str, fallback: str) -> str:
    return slugify(value or "", lowercase=True, separator="-", max_length=200) or fallback


def generate_unique_slug(model_class, value, instance_pk=None, fallback="project"):
    base_slug = build_transliterated_slug(value, fallback)
    slug = base_slug
    suffix = 1

    while True:
        queryset = model_class.objects.filter(slug=slug)
        if instance_pk is not None:
            queryset = queryset.exclude(pk=instance_pk)
        if not queryset.exists():
            return slug

        suffix_part = f"-{suffix}"
        slug = f"{base_slug[:200 - len(suffix_part)]}{suffix_part}"
        suffix += 1


class Project(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
        db_column="created_by",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=200)
    full_description = models.TextField(blank=True)
    geojson = models.JSONField(blank=True, null=True)
    main_image = models.ImageField(upload_to="projects/main/", blank=True, null=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects"
        ordering = ["title"]

    def save(self, *args, **kwargs):
        self.title = normalize_title(self.title)
        title_changed = False
        if self.pk:
            old_instance = Project.objects.filter(pk=self.pk).only("title").first()
            if old_instance and normalize_title(old_instance.title) != self.title:
                title_changed = True
        if not self.slug or title_changed:
            self.slug = generate_unique_slug(
                Project,
                self.title,
                self.pk,
                fallback="project",
            )

        self.delete_old_main_image_if_changed()
        super().save(*args, **kwargs)

    def delete_old_main_image_if_changed(self):
        if not self.pk:
            return

        old_instance = Project.objects.filter(pk=self.pk).only("main_image").first()

        if not old_instance:
            return

        old_image = old_instance.main_image
        new_image = self.main_image

        if old_image and old_image != new_image:
            old_image_path = old_image.path

            if os.path.isfile(old_image_path):
                os.remove(old_image_path)

    def delete(self, *args, **kwargs):
        main_image = self.main_image
        main_image_path = main_image.path if main_image else None

        super().delete(*args, **kwargs)

        if main_image_path and os.path.isfile(main_image_path):
            os.remove(main_image_path)

    def __str__(self):
        return self.title