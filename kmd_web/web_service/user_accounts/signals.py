# users/signals.py

from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

from .tasks import send_password_email_task


# ---------------------------------------------------------
# STORE PREVIOUS STATE (BEFORE SAVE)
# ---------------------------------------------------------
@receiver(pre_save, sender=User)
def store_previous_is_active(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_is_active = None
        return

    try:
        old_user = sender.objects.get(pk=instance.pk)
        instance._previous_is_active = old_user.is_active
    except sender.DoesNotExist:
        instance._previous_is_active = None


# ---------------------------------------------------------
# SEND EMAIL AFTER ACTIVATION (AFTER SAVE)
# ---------------------------------------------------------
@receiver(post_save, sender=User)
def send_password_email_on_activation(sender, instance, created, **kwargs):

    # Skip newly created users
    if created:
        return

    # Ensure previous state exists
    previous = getattr(instance, "_previous_is_active", None)

    # Only trigger when user goes from inactive → active
    if previous is False and instance.is_active is True:

        uid = urlsafe_base64_encode(force_bytes(instance.pk))
        token = default_token_generator.make_token(instance)

        reset_url = f"{settings.FRONTEND_URL}/set-password/{uid}/{token}"

        # ✅ Async (non-blocking)
        send_password_email_task.delay(
            instance.id,
            instance.email,
            reset_url
        )