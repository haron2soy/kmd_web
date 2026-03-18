from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializer import RegisterSerializer
from .models import EmailVerification
from .services import send_register_email

# ---------------------------------------------------------
# CSRF TOKEN VIEW
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    """
    Ensures CSRF cookie is set for SPA clients (React).
    """
    return Response({
        "csrfToken": get_token(request),
        "detail": "CSRF cookie set successfully"
    })


# ---------------------------------------------------------
# REGISTER VIEW
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):

    serializer = RegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    user.is_active = False
    user.save(update_fields=["is_active"])

    EmailVerification.objects.filter(user=user).delete()

    verification = EmailVerification.objects.create(user=user)

    verification_link = f"{settings.FRONTEND_URL}/verify-email/{verification.token}"

    try:
        send_register_email(
            user_email=user.email,
            verification_link=verification_link,
            verification_code=verification.code
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    return Response(
        {"message": "Verification email sent. Please check your inbox."},
        status=status.HTTP_201_CREATED
    )


# ---------------------------------------------------------
# LOGIN VIEW
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):

    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"non_field_errors": ["Username and password are required"]},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {"non_field_errors": ["Invalid username or password"]},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"non_field_errors": ["Please verify your email first"]},
            status=status.HTTP_403_FORBIDDEN
        )

    login(request, user)

    return Response({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })


# ---------------------------------------------------------
# LOGOUT VIEW
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logs out authenticated user and destroys session.
    """
    logout(request)

    return Response({
        "message": "Logout successful"
    })


# ---------------------------------------------------------
# SESSION VIEW
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def session_view(request):
    """
    Returns authentication state for SPA bootstrapping.
    """

    if request.user.is_authenticated:
        return Response({
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email
            }
        })

    return Response({"authenticated": False})


# ---------------------------------------------------------
# VERIFY EMAIL VIEW
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email_view(request, token=None):

    code = request.data.get("code")

    try:

        if token:
            verification = EmailVerification.objects.select_related("user").get(token=token)

        elif code:
            verification = EmailVerification.objects.select_related("user").get(code=code)

        else:
            return Response(
                {"non_field_errors": ["Token or code required"]},
                status=status.HTTP_400_BAD_REQUEST
            )

    except EmailVerification.DoesNotExist:

        return Response(
            {"non_field_errors": ["Invalid verification"]},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check expiration
    if verification.is_expired():

        verification.delete()

        return Response(
            {"non_field_errors": ["Verification expired"]},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = verification.user

    user.is_active = True
    user.save(update_fields=["is_active"])

    verification.delete()

    return Response({
        "message": "Account verified successfully"
    })