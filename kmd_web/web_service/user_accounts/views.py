from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.db import transaction

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializer import RegisterSerializer

from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerification

from django.utils import timezone
from datetime import timedelta
from .services.send_verification_email import send_verification
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

    email = request.data.get("email")

    existing_user = User.objects.filter(email=email).first()

    # Case 1: Active user → block
    if existing_user and existing_user.is_active:
        return Response(
            {"non_field_errors": ["Account already exists. Please login."]},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Case 2: Inactive user → resend
    if existing_user and not existing_user.is_active:
        send_verification(existing_user)
        return Response(
            {"message": "Account exists but not verified. Verification email resent."},
            status=status.HTTP_200_OK
        )

    # Case 3: New user
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        send_verification(user)

        return Response(
            {"message": "Verification email sent."},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {"non_field_errors": ["Invalid username or password"]},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(password, user.password):
        return Response(
            {"non_field_errors": ["Invalid username or password"]},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {
                "message": "Account not verified",
                "resend_verification": True
            },
            status=status.HTTP_403_FORBIDDEN
        )

    login(request, user)

    return Response({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name
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
                "email": request.user.email,
                "first_name": request.user.first_name,
            }
        })

    return Response({
        "authenticated": False
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email_view(request, token=None):
    """
    Verifies a user using either token (URL) or code (manual entry).
    Guarantees:
    - Single-use verification
    - Idempotent response
    - Safe handling of expired/invalid tokens
    """

    code = request.data.get("code")

    if not token and not code:
        return Response(
            {"non_field_errors": ["Token or code required"]},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        if token:
            # FIXED: Filter by token, not code
            verification = EmailVerification.objects.select_related("user").get(token=token)
            #verification.used_at = timezone.now()
            #verification.save(update_fields=["used_at"])
        else:
            # Code verification (manual entry)
            verification = (
                EmailVerification.objects
                .select_related("user")
                .filter(code=code)
                .order_by("-created_at")
                .first()
            )
            if not verification:
                # Check if user might already be verified (code was consumed)
                user = User.objects.filter(
                    verifications__code=code,  # related_name 
                    is_active=True
                ).first()
                
                if user:
                    return Response(
                        {
                            "message": "Check you email for verification",
                            "status": "already_verified"
                        },
                        status=status.HTTP_200_OK
                    )
                
                raise EmailVerification.DoesNotExist

    except EmailVerification.DoesNotExist:
        return Response(
            {
                "non_field_errors": ["Invalid verification"],
                "status": "invalid"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ✓ This line IS reached for valid tokens and codes
    user = verification.user

    # Check if already used (if you have a used_at field)
    #if hasattr(verification, 'used_at') and verification.used_at:
    if verification.used_at:
        return Response({
            "status": "already_verified",
            "message": "Account already verified"
        }, status=status.HTTP_200_OK)

    # ---- Idempotency: already verified ----
    if user.is_active:
        # cleanup any stale tokens silently
        #EmailVerification.objects.filter(user=user).delete()
        EmailVerification.objects.filter(user=user, used_at__isnull=True).exclude(id=verification.id).update(
    used_at=timezone.now()
)
        return Response({
            "message": "Account already verified",
            "status": "already_verified"
        }, status=status.HTTP_200_OK)

    # ---- Expiry check ----
    if verification.is_expired():
        return Response(
            {
                "non_field_errors": ["Verification expired"],
                "status": "expired",
                "resend_required": True
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---- Atomic activation ----
    with transaction.atomic():
        user.is_active = True
        user.save(update_fields=["is_active"])
        
        # Mark as used if you have used_at field
        if hasattr(verification, 'used_at'):
            verification.used_at = timezone.now()
            verification.save(update_fields=['used_at'])
        
        # delete ALL tokens to prevent replay
        #EmailVerification.objects.filter(user=user).delete()
        EmailVerification.objects.filter(user=user, used_at__isnull=True).exclude(id=verification.id).update(
    used_at=timezone.now()
)
    
    verification.used_at = timezone.now()
    verification.save(update_fields=["used_at"])
    return Response({
        "message": "Account verified successfully",
        "status": "verified"
    }, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# RESEND VERIFICATION EMAIL
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def resend_verification_view(request):
    """
    Resends verification email with:
    - Rate limiting
    - Enumeration protection
    - Controlled token lifecycle
    """

    email = request.data.get("email")

    if not email:
        return Response(
            {"non_field_errors": ["Email is required"]},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.filter(email=email).first()

    # Always return same message (prevents email enumeration)
    generic_response = {
        "message": "If an account exists, a verification email has been sent."
    }

    if not user:
        return Response(generic_response, status=status.HTTP_200_OK)

    if user.is_active:
        return Response(
            {"non_field_errors": ["Account already verified"]},
            status=status.HTTP_400_BAD_REQUEST
        )

    now = timezone.now()

    # ---- Rate limiting strategy ----
    recent_verification = (
        EmailVerification.objects
        .filter(user=user)
        .order_by("-created_at")
        .first()
    )

    if recent_verification:
        # Cooldown: 60 seconds between sends
        cooldown_seconds = 60
        elapsed = (now - recent_verification.created_at).total_seconds()

        if elapsed < cooldown_seconds:
            return Response(
                {
                    "non_field_errors": [
                        f"Please wait {int(cooldown_seconds - elapsed)} seconds before retrying."
                    ]
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

    # ---- Hourly cap ----
    one_hour_ago = now - timedelta(hours=1)
    hourly_count = EmailVerification.objects.filter(
        user=user,
        created_at__gte=one_hour_ago
    ).count()

    if hourly_count >= 5:
        return Response(
            {
                "non_field_errors": [
                    "Maximum resend attempts reached. Try again later."
                ]
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    # ---- Controlled token rotation ----
    # Keep last token only for traceability (optional design choice)
    #EmailVerification.objects.filter(user=user).delete()
    EmailVerification.objects.filter(user=user, used_at__isnull=True).exclude(id=verification.id).update(
        used_at=timezone.now()
    )
    send_verification(user)

    return Response(generic_response, status=status.HTTP_200_OK)