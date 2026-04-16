from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .forms import UserChangeForm, UserCreationForm
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
        "last_login",
    )
    list_filter = (
        "role",
        "is_active",
        "date_joined",
        "last_login",
    )
    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )
    readonly_fields = (
        "date_joined",
        "last_login",
    )
    ordering = ("username",)

    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Profile", {"fields": ("first_name", "last_name", "role", "is_active")}),
        ("Dates", {"fields": ("date_joined", "last_login")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "role",
                    "is_active",
                    "password1",
                    "password2",
                ),
            },
        ),
    )

    filter_horizontal = ()