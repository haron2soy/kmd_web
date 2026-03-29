import time

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from django.core.exceptions import ValidationError

User = get_user_model()

# CONFIG
IP_COOLDOWN = 10
DELAY_SECONDS = 0.5


def _rate_limit(key, timeout):
    if cache.get(key):
        return False
    cache.set(key, True, timeout)
    return True


@api_view(["POST"])
@permission_classes([AllowAny])
def validate_reset_token(request):
    uidb64 = request.data.get("uidb64")
    token = request.data.get("token")

    if not uidb64 or not token:
        return Response(
            {"valid": False, "error": "Invalid link"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=int(uid))
    except Exception:
        return Response(
            {"valid": False, "error": "Invalid link"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not default_token_generator.check_token(user, token):
        return Response(
            {"valid": False, "error": "Link expired or invalid"},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({"valid": True})

def _common_password_flow(request, *, mode: str):
    """
    mode: "setup" | "reset"
    """

    start_time = time.time()

    uidb64 = request.data.get("uidb64")
    token = request.data.get("token")
    password = request.data.get("password")
    confirm_password = request.data.get("confirm_password")

    ip = request.META.get("REMOTE_ADDR")

    # ---- Rate limit ----
    if ip and not _rate_limit(f"rp_ip_{ip}", IP_COOLDOWN):
        return Response(
            {"error": {"code": "rate_limited", "message": "Too many attempts"}},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    # ---- Input validation ----
    if not uidb64 or not token:
        return Response(
            {"error": {"code": "invalid_request", "message": "Invalid link"}},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not password or not confirm_password:
        return Response(
            {"error": {"code": "missing_fields", "message": "Password fields required"}},
            status=status.HTTP_400_BAD_REQUEST
        )

    if password != confirm_password:
        return Response(
            {"error": {"code": "password_mismatch", "message": "Passwords do not match"}},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---- Decode user ----
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=int(uid))
    except Exception:
        return Response(
            {"error": {"code": "invalid_link", "message": "Invalid or expired link"}},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---- Token validation ----
    if not default_token_generator.check_token(user, token):
        return Response(
            {"error": {"code": "invalid_token", "message": "Invalid or expired token"}},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---- Mode-specific rules ----
    if mode == "setup":
        if user.has_usable_password():
            return Response(
                {"error": {"code": "already_set", "message": "Password already set"}},
                status=status.HTTP_400_BAD_REQUEST
            )

    elif mode == "reset":
        if not user.has_usable_password():
            return Response(
                {"error": {"code": "no_existing_password", "message": "Use setup instead"}},
                status=status.HTTP_400_BAD_REQUEST
            )

    # ---- Password validation ----
    try:
        validate_password(password, user=user)
    except ValidationError as e:
        return Response(
            {
                "error": {
                    "code": "weak_password",
                    "message": "Password does not meet requirements",
                    "details": e.messages
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # ---- Prevent token reuse (user-scoped) ----
        token_key = f"used_token_{user.pk}_{token}"

        if cache.get(token_key):
            return Response(
                {"error": {"code": "token_used", "message": "Token already used"}},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(password)
        user.save()

        cache.set(token_key, True, timeout=60 * 60 * 24)

    except Exception:
        return Response(
            {"error": {"code": "server_error", "message": "Unable to process request"}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # ---- Anti-enumeration timing ----
    elapsed = time.time() - start_time
    if elapsed < DELAY_SECONDS:
        time.sleep(DELAY_SECONDS - elapsed)

    return Response({
        "message": "Password set successfully" if mode == "setup" else "Password reset successful"
    })


# ---------------------------------------------------------
# PUBLIC VIEWS
# ---------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def set_password(request):
    """
    First-time password creation (account activation)
    """
    return _common_password_flow(request, mode="setup")


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Standard forgot-password reset
    """
    return _common_password_flow(request, mode="reset")