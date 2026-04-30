from django.urls import path

from .views import ProjectDetailView, ProjectListCreateView, ProjectManageView


urlpatterns = [
    path("projects/", ProjectListCreateView.as_view(), name="project-list-create"),

    path("projects/id/<int:pk>/", ProjectManageView.as_view(), name="project-manage"),

    path("projects/<slug:slug>/", ProjectDetailView.as_view(), name="project-detail"),
]
