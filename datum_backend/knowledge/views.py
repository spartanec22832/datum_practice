from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import Card, CardMedia, Section
from .permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthorOrAdmin,
    IsCardAuthorOrAdminForMedia,
)
from .serializers import (
    CardMediaSerializer,
    CardReadSerializer,
    CardWriteSerializer,
    SectionContentSerializer,
    SectionSerializer,
)


def filter_authored_or_published(queryset, user):
    if user.is_authenticated and user.is_staff:
        return queryset
    if user.is_authenticated:
        return queryset.filter(Q(is_published=True) | Q(author=user)).distinct()
    return queryset.filter(is_published=True)


class SectionListCreateView(generics.ListCreateAPIView):
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Section.objects.select_related("parent", "author").all()
        parent_id = self.request.query_params.get("parent")
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
        return filter_authored_or_published(queryset, self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class SectionDetailView(generics.RetrieveAPIView):
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Section.objects.select_related("parent", "author").all()
        return filter_authored_or_published(queryset, self.request.user)


class SectionContentView(generics.RetrieveAPIView):
    serializer_class = SectionContentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Section.objects.select_related("parent", "author").prefetch_related(
            "children__author",
            "cards__author",
            "cards__section",
            "cards__media_items",
        )
        return filter_authored_or_published(queryset, self.request.user)


class SectionManageView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Section.objects.select_related("parent", "author").all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthorOrAdmin]
    http_method_names = ["put", "patch", "delete", "options"]

class CardListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CardWriteSerializer
        return CardReadSerializer

    def get_queryset(self):
        queryset = Card.objects.select_related("section", "author").prefetch_related(
            "media_items",
        )
        section_id = self.request.query_params.get("section")
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        return filter_authored_or_published(queryset, self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CardDetailView(generics.RetrieveAPIView):
    serializer_class = CardReadSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Card.objects.select_related("section", "author").prefetch_related(
            "media_items",
        )
        return filter_authored_or_published(queryset, self.request.user)


class CardManageView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Card.objects.select_related("section", "author").prefetch_related("media_items")
    permission_classes = [IsAuthorOrAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    http_method_names = ["get", "put", "patch", "delete", "options"]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return CardWriteSerializer
        return CardReadSerializer


class CardMediaListCreateView(generics.ListCreateAPIView):
    serializer_class = CardMediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_card_for_read(self):
        queryset = Card.objects.select_related("section", "author")
        queryset = filter_authored_or_published(queryset, self.request.user)
        return get_object_or_404(queryset, pk=self.kwargs["card_id"])

    def get_card_for_write(self):
        card = get_object_or_404(
            Card.objects.select_related("section", "author"),
            pk=self.kwargs["card_id"],
        )
        user = self.request.user

        if not user.is_authenticated:
            raise PermissionDenied(
                "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044f."
            )

        if not (user.is_staff or card.author_id == user.id):
            raise PermissionDenied(
                "\u0423 \u0432\u0430\u0441 \u043d\u0435\u0442 \u043f\u0440\u0430\u0432 \u0434\u043b\u044f \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0432\u043b\u043e\u0436\u0435\u043d\u0438\u0439 \u043a \u044d\u0442\u043e\u0439 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435."
            )

        return card

    def get_card(self):
        if self.request.method == "POST":
            return self.get_card_for_write()
        return self.get_card_for_read()

    def get_queryset(self):
        card = self.get_card()
        return card.media_items.all()

    def perform_create(self, serializer):
        card = self.get_card_for_write()
        serializer.save(card=card)


class CardMediaAllowedExtensionsView(APIView):
    permission_classes = []

    def get(self, request):
        return Response({
            "extensions": CardMedia.get_allowed_extensions(),
            "extensions_by_type": CardMedia.get_allowed_extensions_by_type(),
        })


class CardMediaManageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CardMediaSerializer
    permission_classes = [IsCardAuthorOrAdminForMedia]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ["get", "patch", "delete", "options"]

    def get_queryset(self):
        queryset = CardMedia.objects.select_related("card", "card__author", "card__section")

        if self.request.method in ("PATCH", "DELETE"):
            return queryset

        visible_cards = filter_authored_or_published(
            Card.objects.select_related("section", "author"),
            self.request.user,
        )
        return queryset.filter(card__in=visible_cards)
