from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializer import RegisterSerializer

from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerification

# ---------------------------------------------------------
# CSRF TOKEN VIEW
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    """
    Ensures CSRF cookie is set for SPA clients (React).
    Returns CSRF token explicitly for debugging / manual usage.
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

    if serializer.is_valid():
        user = serializer.save()

        # Create verification record
        verification = EmailVerification.objects.create(user=user)

        verification_link = f"http://localhost:5173/verify-email/{verification.token}"

        send_mail(
            subject="Verify Your Account",
            message=f"""
Welcome!

Click the link below to verify your account:
{verification_link}

Or use this verification code:
{verification.code}

This link expires in 24 hours.
""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return Response(
            {"message": "Verification email sent. Please check your inbox."},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# LOGIN VIEW
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticates user and creates session.
    """
    username = request.data.get("username")
    password = request.data.get("password")
    
    
    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)
    
    if not user.is_active:
        return Response({"error": "Please verify your email first"}, status=403)
    
    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
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
    Returns current session authentication state.
    Useful for React app bootstrapping.
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

    return Response({
        "authenticated": False
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email_view(request):
    token = request.data.get("token")
    code = request.data.get("code")

    try:
        if token:
            verification = EmailVerification.objects.get(token=token)
        elif code:
            verification = EmailVerification.objects.get(code=code)
        else:
            return Response({"error": "Token or code required"}, status=400)

    except EmailVerification.DoesNotExist:
        return Response({"error": "Invalid verification"}, status=400)

    if verification.is_expired():
        return Response({"error": "Verification expired"}, status=400)

    user = verification.user
    user.is_active = True
    user.save()

    verification.delete()

    return Response({"message": "Account verified successfully"})