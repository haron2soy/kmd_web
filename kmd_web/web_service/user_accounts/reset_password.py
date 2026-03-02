import json
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.http import JsonResponse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from .services.send_password_reset_email import send_password_reset_email

User = get_user_model()
logger = logging.getLogger(__name__)


@csrf_protect
@require_POST
def forgot_password(request):
    """
    Initiates password reset process.
    Always returns generic success response (prevents user enumeration).
    """

    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()

        if not email:
            return JsonResponse(
                {"detail": "Email is required."},
                status=400
            )

        try:
            user = User.objects.get(email=email, is_active=True)

            # Encode user ID securely
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            frontend_base = settings.FRONTEND_BASE_URL.rstrip("/")
            reset_url = f"{frontend_base}/reset-password/{uid}/{token}/"

            '''reset_url = (
                f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            )'''

            send_password_reset_email(email, reset_url)

          

        except User.DoesNotExist:
            # Deliberately silent (security best practice)
            pass

        return JsonResponse({
            "detail": "If an account with that email exists, a reset link has been sent."
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"detail": "Invalid request format."},
            status=400
        )

    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return JsonResponse(
            {"detail": "Unable to process request at this time."},
            status=500
        )