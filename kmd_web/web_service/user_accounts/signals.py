# users/signals.py

from django.contrib.auth.models import User
from django.db.models.signals import pre_save
from django.dispatch import receiver

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from django.conf import settings
from .services.send_password_setup_email import send_password_setup_email

from django.core.cache import cache

@receiver(pre_save, sender=User)
def send_password_email_on_activation(sender, instance, **kwargs):

    if not instance.pk:
        return

    try:
        old_user = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    if not old_user.is_active and instance.is_active:

        uid = urlsafe_base64_encode(force_bytes(instance.pk))
        token = default_token_generator.make_token(instance)

        reset_url = f"{settings.FRONTEND_URL}/set-password/{uid}/{token}"
        
        if not cache.get(f"activation_sent_{instance.pk}"):
            send_password_setup_email(instance, reset_url)
            cache.set(f"activation_sent_{instance.pk}", True, timeout=86400)