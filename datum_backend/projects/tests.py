from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Project


User = get_user_model()


class ProjectApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="strong-password-123",
            role="admin",
        )
        self.user = User.objects.create_user(
            username="user",
            email="user@example.com",
            password="strong-password-123",
        )
        self.published_project = Project.objects.create(
            created_by=self.admin,
            title="Published project",
            short_description="Visible project",
            full_description="Visible project description",
            is_published=True,
        )
        self.private_project = Project.objects.create(
            created_by=self.admin,
            title="Private project",
            short_description="Hidden project",
            full_description="Hidden project description",
            is_published=False,
        )

    def test_anonymous_user_sees_only_published_projects(self):
        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["slug"], self.published_project.slug)

    def test_non_admin_cannot_create_project(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/projects/",
            {
                "title": "New project",
                "short_description": "Description",
                "full_description": "Full description",
                "is_published": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_project(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/projects/",
            {
                "title": "New project",
                "short_description": "Description",
                "full_description": "Full description",
                "geojson": {"type": "Point", "coordinates": [39.7, 47.2]},
                "is_published": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 3)
        self.assertEqual(response.data["created_by_username"], self.admin.username)

    def test_anonymous_user_cannot_open_unpublished_project(self):
        response = self.client.get(f"/api/projects/{self.private_project.slug}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
