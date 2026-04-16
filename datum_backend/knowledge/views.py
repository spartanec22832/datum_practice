from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser

from .models import Card, CardMedia, Section
from .permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthorOrAdmin,
    IsCardAuthorOrAdminForMedia,
)
from .serializers import (
    CardMediaSerializer,
    CardSerializer,
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
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Section.objects.select_related("parent", "author").all()
        return filter_authored_or_published(queryset, self.request.user)


class SectionContentView(generics.RetrieveAPIView):
    serializer_class = SectionContentSerializer
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
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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
    serializer_class = CardSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Card.objects.select_related("section", "author").prefetch_related(
            "media_items",
        )
        return filter_authored_or_published(queryset, self.request.user)


class CardManageView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Card.objects.select_related("section", "author").prefetch_related("media_items")
    serializer_class = CardSerializer
    permission_classes = [IsAuthorOrAdmin]
    http_method_names = ["put", "patch", "delete", "options"]


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
            raise PermissionDenied("Authentication required.")

        if not (user.is_staff or card.author_id == user.id):
            raise PermissionDenied("You cannot add media to this card.")

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