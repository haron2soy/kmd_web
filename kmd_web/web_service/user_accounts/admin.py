from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm
from django import forms

from .models import EmailVerification

# ---------------------------------------------------------
# CUSTOM USER CREATION FORM
# ---------------------------------------------------------
class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "username", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        # Use email as username for consistency with your serializer
        user.username = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

# ---------------------------------------------------------
# CUSTOM USER ADMIN
# ---------------------------------------------------------
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm

    # Fields for the "Add User" page (single-step creation)
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("first_name", "last_name", "email", "username", "password1", "password2", "is_active", "is_staff"),
        }),
    )

    # Fields for the "Edit User" page
    fieldsets = (
        ("Authentication", {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    list_display = ("id", "username", "email", "first_name", "last_name", "is_active", "is_staff", "date_joined")
    list_filter = ("is_active", "is_staff", "is_superuser", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)

# Unregister default User and register custom admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# ---------------------------------------------------------
# EMAIL VERIFICATION ADMIN
# ---------------------------------------------------------
@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ("user", "code", "token", "created_at", "expires_at")
    search_fields = ("user__email", "user__username", "code")
    list_filter = ("created_at", "expires_at")
    readonly_fields = ("token", "created_at", "expires_at")
    ordering = ("-created_at",)