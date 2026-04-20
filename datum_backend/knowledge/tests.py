from django.contrib.auth import get_user_model
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
            f"/api/sections/{self.section.id}/",
            {"title": "Hijacked"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_edit_foreign_card(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/cards/{self.card.id}/",
            {"title": "Approved onboarding"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.card.refresh_from_db()
        self.assertEqual(self.card.title, "Approved onboarding")

    def test_anonymous_section_content_returns_published_children_only(self):
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

        response = self.client.get(f"/api/sections/{self.section.slug}/content/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        child_slugs = {item["slug"] for item in response.data["child_sections"]}
        card_slugs = {item["slug"] for item in response.data["cards"]}
        self.assertIn(published_child.slug, child_slugs)
        self.assertNotIn(hidden_section.slug, child_slugs)
        self.assertIn(self.card.slug, card_slugs)
