from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Card, Section


User = get_user_model()


class KnowledgeApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="strong-password-123",
            role="admin",
        )
        self.author = User.objects.create_user(
            username="author",
            email="author@example.com",
            password="strong-password-123",
        )
        self.other_user = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="strong-password-123",
        )
        self.section = Section.objects.create(
            title="Team docs",
            description="Knowledge base section",
            author=self.author,
            is_published=True,
        )
        self.card = Card.objects.create(
            title="Onboarding",
            summary="Welcome info",
            content="Detailed onboarding info",
            section=self.section,
            author=self.author,
            is_published=True,
        )

    def test_authenticated_user_can_create_section(self):
        self.client.force_authenticate(self.author)
        response = self.client.post(
            "/api/sections/",
            {
                "title": "New section",
                "description": "Description",
                "parent": self.section.id,
                "is_published": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author_username"], self.author.username)

    def test_author_can_create_card(self):
        self.client.force_authenticate(self.author)
        response = self.client.post(
            "/api/cards/",
            {
                "title": "Architecture",
                "summary": "Draft summary",
                "content": "Draft content",
                "section": self.section.id,
                "is_published": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author_username"], self.author.username)

    def test_other_user_cannot_edit_foreign_section(self):
        self.client.force_authenticate(self.other_user)
        response = self.client.patch(
            f"/api/sections/id/{self.section.id}/",
            {"title": "Hijacked"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_edit_foreign_card(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/cards/id/{self.card.id}/",
            {"title": "Approved onboarding"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.card.refresh_from_db()
        self.assertEqual(self.card.title, "Approved onboarding")

    def test_card_media_allowed_extensions_are_exposed(self):
        response = self.client.get("/api/media/allowed-extensions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(".jsx", response.data["extensions"])
        self.assertEqual(
            sorted(response.data["extensions"]),
            response.data["extensions"],
        )

    def test_unsupported_card_media_returns_validation_error(self):
        self.client.force_authenticate(self.author)
        response = self.client.post(
            f"/api/cards/{self.card.id}/media/",
            {
                "file": SimpleUploadedFile(
                    "map.geojson",
                    b'{"type":"FeatureCollection","features":[]}',
                    content_type="application/geo+json",
                ),
                "caption": "Map source",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)
        self.assertIn(
            "\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0444\u0430\u0439\u043b\u0430: .geojson.",
            str(response.data["file"][0]),
        )

    def test_authenticated_section_content_returns_published_children_only(self):
        hidden_section = Section.objects.create(
            title="Hidden child",
            description="Draft child",
            author=self.author,
            parent=self.section,
            is_published=False,
        )
        Card.objects.create(
            title="Draft card",
            summary="Hidden",
            content="Hidden content",
            section=self.section,
            author=self.author,
            is_published=False,
        )
        published_child = Section.objects.create(
            title="Published child",
            description="Visible child",
            author=self.author,
            parent=self.section,
            is_published=True,
        )

        self.client.force_authenticate(self.other_user)
        response = self.client.get(f"/api/sections/{self.section.slug}/content/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        child_slugs = {item["slug"] for item in response.data["child_sections"]}
        card_slugs = {item["slug"] for item in response.data["cards"]}
        self.assertIn(published_child.slug, child_slugs)
        self.assertNotIn(hidden_section.slug, child_slugs)
        self.assertIn(self.card.slug, card_slugs)
