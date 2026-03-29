# users/forgot_password.py

import time

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .services.send_password_reset_email import send_password_reset_email
from .tasks import send_password_email_task

User = get_user_model()


# CONFIG
EMAIL_COOLDOWN = 60        # seconds
IP_COOLDOWN = 30           # seconds
DELAY_SECONDS = 0.5        # anti-enumeration delay


def _rate_limit(key, timeout):
    if cache.get(key):
        return False
    cache.set(key, True, timeout)
    return True


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    start_time = time.time()

    email = (request.data.get("email") or "").strip().lower()
    ip = request.META.get("REMOTE_ADDR")

    

    generic_response = {
        "message": "If an account exists, a reset link has been sent."
    }

    # ---- CAPTCHA ----
    captcha = request.data.get("captcha")
    if settings.ENABLE_CAPTCHA:
        if not captcha or captcha != "PASSED":
            
            return Response(
                {"error": {"code": "invalid_captcha", "message": "Captcha failed"}},
                status=status.HTTP_400_BAD_REQUEST
            )

    # ---- Rate limiting ----
    if ip and not _rate_limit(f"fp_ip_{ip}", IP_COOLDOWN):
        
        return Response(
            {"error": {"code": "rate_limited", "message": "Too many requests"}},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    if email and not _rate_limit(f"fp_email_{email}", EMAIL_COOLDOWN):
        
        return Response(
            {"error": {"code": "rate_limited", "message": "Try again later"}},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    try:
        user = User.objects.filter(email=email, is_active=True).first()

        if user:
            

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

            

            # 🔥 TEMP: run both sync + async to isolate issue
           
            #send_password_reset_email(user, reset_url)

            
            send_password_email_task.delay(
                user.id,
                user.email,
                reset_url,
                "reset"
                )



    except Exception as e:
       
        return Response(
                {"error": "If an account exists, a reset link has been sent."},
                status=status.HTTP_200_OK
            )
    elapsed = time.time() - start_time
    if elapsed < DELAY_SECONDS:
        time.sleep(DELAY_SECONDS - elapsed)

    return Response(generic_response, status=status.HTTP_200_OK)