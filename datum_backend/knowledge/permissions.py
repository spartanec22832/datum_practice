from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Для справочника:
    название немного не отражает суть, но справочник полностью закрыт для неавторизованных теперь на уровне API
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAuthorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_staff or obj.author_id == request.user.id)


class IsCardAuthorOrAdminForMedia(BasePermission):
    """
    Для CardMedia:
    - читать могут только авторизованные пользователи
    - менять может только автор карточки или админ
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in SAFE_METHODS:
            return bool(user and user.is_authenticated)

        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or obj.card.author_id == user.id)
        )