from django.core.mail import send_mail
from user_accounts.models import EmailVerification
from django.conf import settings
from django.utils import timezone

import logging

logger = logging.getLogger(__name__)

def send_verification_email(user, link):
    try:
        send_mail(
            "Verify your email",
            f"Click here: {link}",
            "noreply@example.com",
            [user.email],
            fail_silently=False,
        )
        return True

    except Exception as e:
        logger.error(f"Email send failed for {user.email}: {e}")
        return False

def send_verification(user):
    # delete old tokens
    #EmailVerification.objects.filter(user=user).delete()


    verification = EmailVerification.objects.create(user=user)
    #verification.used_at = timezone.now()
    #verification.save(update_fields=["used_at"])

    verification_link = f"{settings.FRONTEND_URL}/verify-email/{verification.token}"

    send_mail(
        subject="Verify Your Account",
        message=f"""
Click the link below to verify your account:

{verification_link}

Verification code:
{verification.code}
""",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )

    return verification