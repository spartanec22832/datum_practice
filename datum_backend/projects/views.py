from rest_framework import generics

from .models import Project
from .permissions import IsAdminOrReadOnly
from .serializers import ProjectSerializer


class ProjectQuerysetMixin:
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Project.objects.all()
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return queryset
        return queryset.filter(is_published=True)


class ProjectListCreateView(ProjectQuerysetMixin, generics.ListCreateAPIView):
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectDetailView(ProjectQuerysetMixin, generics.RetrieveAPIView):
    lookup_field = "slug"


class ProjectManageView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    http_method_names = ["put", "patch", "delete", "options"]
