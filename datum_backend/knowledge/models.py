from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from slugify import slugify
import os
import uuid
import re

def normalize_title(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())

def build_transliterated_slug(value: str, fallback: str) -> str:
    return slugify(value or "", lowercase=True, separator="-", max_length=200) or fallback


def generate_unique_slug(model_class, value, instance_pk=None, fallback="item"):
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


def card_main_image_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f"cards/main_images/{uuid.uuid4().hex}{ext}"


def card_media_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    media_type = instance.media_type or "other"
    card_id = instance.card_id or "tmp"
    return f"cards/attachments/{card_id}/{media_type}/{uuid.uuid4().hex}{ext}"


class Section(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="children",
        blank=True,
        null=True,
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sections",
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sections"
        ordering = ("sort_order", "title")

    def clean(self):
        if self.parent_id and self.parent_id == self.pk:
            raise ValidationError({"parent": "Section cannot be its own parent."})

    def save(self, *args, **kwargs):
        self.title = normalize_title(self.title)
        self.full_clean()
        if not self.slug:
            self.slug = generate_unique_slug(Section, self.title, self.pk, fallback="section")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Card(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    summary = models.TextField(blank=True)
    content = models.TextField()
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="cards",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cards",
    )
    main_image = models.ImageField(
        upload_to=card_main_image_upload_to,
        blank=True,
        null=True,
        verbose_name="Главное фото",
    )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cards"
        ordering = ("title",)

    def save(self, *args, **kwargs):
        self.title = normalize_title(self.title)
        old_image = None
        if self.pk:
            try:
                old_instance = Card.objects.get(pk=self.pk)
                old_image = old_instance.main_image
            except Card.DoesNotExist:
                old_image = None

        if not self.slug:
            self.slug = generate_unique_slug(Card, self.title, self.pk, fallback="card")

        super().save(*args, **kwargs)

        old_name = old_image.name if old_image else ""
        new_name = self.main_image.name if self.main_image else ""

        if old_name and old_name != new_name:
            if old_image.storage.exists(old_name):
                old_image.storage.delete(old_name)

    def delete(self, *args, **kwargs):
        image = self.main_image
        super().delete(*args, **kwargs)
        if image and image.name and image.storage.exists(image.name):
            image.storage.delete(image.name)

    def __str__(self):
        return self.title


class CardMedia(models.Model):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"

    MEDIA_TYPE_CHOICES = (
        (IMAGE, "Image"),
        (VIDEO, "Video"),
        (AUDIO, "Audio"),
        (DOCUMENT, "Document"),
    )

    IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
    AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a"}
    DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".xlsx", ".pptx"}

    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="media_items")
    file = models.FileField(
        upload_to=card_media_upload_to,
        verbose_name="Файл",
        blank=True,
        null=True,
    )
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES, blank=True)
    caption = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "card_media"
        ordering = ("sort_order", "id")

    def detect_media_type(self):
        if not self.file:
            return ""
        ext = os.path.splitext(self.file.name)[1].lower()
        if ext in self.IMAGE_EXTENSIONS:
            return self.IMAGE
        if ext in self.VIDEO_EXTENSIONS:
            return self.VIDEO
        if ext in self.AUDIO_EXTENSIONS:
            return self.AUDIO
        return self.DOCUMENT

    def clean(self):
        super().clean()
        if self.file:
            ext = os.path.splitext(self.file.name)[1].lower()
            allowed_exts = (
                self.IMAGE_EXTENSIONS
                | self.VIDEO_EXTENSIONS
                | self.AUDIO_EXTENSIONS
                | self.DOCUMENT_EXTENSIONS
            )
            if ext not in allowed_exts:
                raise ValidationError({"file": f"Unsupported file type: {ext}"})

    def save(self, *args, **kwargs):
        old_file = None
        if self.pk:
            try:
                old_instance = CardMedia.objects.get(pk=self.pk)
                old_file = old_instance.file
            except CardMedia.DoesNotExist:
                old_file = None

        if self.file and not self.media_type:
            self.media_type = self.detect_media_type()
        elif not self.file:
            self.media_type = ""

        self.full_clean()
        super().save(*args, **kwargs)

        old_name = old_file.name if old_file else ""
        new_name = self.file.name if self.file else ""

        if old_name and old_name != new_name:
            if old_file.storage.exists(old_name):
                old_file.storage.delete(old_name)

    def delete(self, *args, **kwargs):
        file_obj = self.file
        super().delete(*args, **kwargs)
        if file_obj and file_obj.name and file_obj.storage.exists(file_obj.name):
            file_obj.storage.delete(file_obj.name)

    def __str__(self):
        return f"{self.card.title} - {self.media_type or 'no-file'}"