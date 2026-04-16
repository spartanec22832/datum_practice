from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="reader",
            email="reader@example.com",
            password="strong-password-123",
        )

    def test_login_returns_tokens_and_me_returns_profile(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "reader", "password": "strong-password-123"},
            format="json",
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")
        me_response = self.client.get("/api/auth/me/")

        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["username"], self.user.username)
        self.assertEqual(me_response.data["role"], "user")
