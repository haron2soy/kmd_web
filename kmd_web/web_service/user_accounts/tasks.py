# users/tasks.py

import logging
from celery import shared_task
from django.contrib.auth import get_user_model

from .models import EmailLog
from .services.send_password_setup_email import send_password_setup_email

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, retry_kwargs={"max_retries": 3})
def send_password_email_task(self, user_id, email, reset_url):
    logger.info(f"[CELERY] Task received | user_id={user_id} email={email}")

    try:
        user = User.objects.get(id=user_id)
        logger.info(f"[CELERY] User fetched | id={user.id} email={user.email}")

        send_password_setup_email(user, reset_url)

        logger.info(f"[CELERY] Email sent successfully | email={email}")

        EmailLog.objects.create(
            email=email,
            status="sent",
            subject="Password Reset"
        )

    except User.DoesNotExist:
        logger.error(f"[CELERY] User not found | user_id={user_id}")

    except Exception as e:
        logger.error(f"[CELERY] Email send failed | email={email} error={str(e)}")

        EmailLog.objects.create(
            email=email,
            status="failed",
            subject="Password Reset",
            error=str(e)
        )

        raise