from django.urls import path

from .views import (
    CardDetailView,
    CardListCreateView,
    CardManageView,
    CardMediaListCreateView,
    CardMediaManageView,
    SectionContentView,
    SectionDetailView,
    SectionListCreateView,
    SectionManageView,
)


urlpatterns = [
    path("sections/", SectionListCreateView.as_view(), name="section-list-create"),
    path("sections/<slug:slug>/content/", SectionContentView.as_view(), name="section-content"),
    path("sections/<int:pk>/", SectionManageView.as_view(), name="section-manage"),
    path("sections/<slug:slug>/", SectionDetailView.as_view(), name="section-detail"),

    path("cards/", CardListCreateView.as_view(), name="card-list-create"),
    path("cards/<int:card_id>/media/", CardMediaListCreateView.as_view(), name="card-media-list-create"),
    path("cards/<int:pk>/", CardManageView.as_view(), name="card-manage"),
    path("cards/<slug:slug>/", CardDetailView.as_view(), name="card-detail"),

    path("media/<int:pk>/", CardMediaManageView.as_view(), name="card-media-manage"),
]