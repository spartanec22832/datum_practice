from django.conf import settings
from django.db import models
from django.template.defaultfilters import slugify


def generate_unique_slug(model_class, value, instance_pk=None):
    base_slug = slugify(value)[:200] or "project"
    slug = base_slug
    suffix = 1

    while True:
        queryset = model_class.objects.filter(slug=slug)
        if instance_pk is not None:
            queryset = queryset.exclude(pk=instance_pk)
        if not queryset.exists():
            return slug
        slug = f"{base_slug[:190]}-{suffix}"
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
    short_description = models.TextField()
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
        if not self.slug:
            self.slug = generate_unique_slug(Project, self.title, self.pk)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
