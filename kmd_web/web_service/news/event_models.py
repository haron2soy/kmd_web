# models.py
from django.db import models
from django.utils.text import slugify
from django.utils import timezone


class Event(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    description = models.TextField(blank=True)

    location = models.CharField(max_length=255, default="Nairobi, Kenya")

    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["start_date"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.title)

            original = self.slug
            count = 1

            while Event.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original}-{count}"
                count += 1

        super().save(*args, **kwargs)