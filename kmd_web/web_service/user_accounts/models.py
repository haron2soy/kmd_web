from django.db import models
import uuid
import random
import string
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


def generate_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))


class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verifications")
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    code = models.CharField(max_length=10, default=generate_code)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

class EmailDelivery(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email_type = models.CharField(max_length=50)
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[("sent","sent"), ("failed","failed")]
    )
    error_message = models.TextField(null=True, blank=True)

class EmailLog(models.Model):
    email = models.EmailField()
    status = models.CharField(max_length=20)  # sent, failed
    subject = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    error = models.TextField(blank=True, null=True)