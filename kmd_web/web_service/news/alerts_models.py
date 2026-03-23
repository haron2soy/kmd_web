from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Warning(models.Model):
    WARNING_TYPES = [
        ("heavy_rainfall", "Heavy Rainfall Alert"),
        ("strong_wind", "Strong Wind Alert"),
        ("high_tides", "High Tides"),
        ("high_temperature", "High Temperature"),
        ("high_uv", "High UV Alert"),
        ("small_aircraft", "Small Aircraft Advisory"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    warning_type = models.CharField(max_length=50, choices=WARNING_TYPES)
    message = models.TextField()
    start_at = models.DateTimeField(default=timezone.now)
    end_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher number = more important")

    # Optional: store icon/color in DB or generate in property
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "-start_at"]
        verbose_name_plural = "warnings"

    def __str__(self):
        return f"{self.title} ({'Active' if self.is_active else 'Inactive'})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            original = self.slug
            count = 1
            while Warning.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original}-{count}"
                count += 1
        super().save(*args, **kwargs)

    @property
    def is_currently_active(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.start_at:
            return False
        if self.end_at and now > self.end_at:
            return False
        return True

    @property
    def icon(self):
        """Return a simple icon name for frontend (can be used with Lucide/React)"""
        mapping = {
            "heavy_rainfall": "CloudRain",
            "strong_wind": "Wind",
            "high_tides": "Anchor",
            "high_temperature": "Sun",
            "high_uv": "SunHigh",
            "small_aircraft": "Airplane",
        }
        return mapping.get(self.warning_type, "AlertTriangle")

    @property
    def color(self):
        """Return a Tailwind color class for the warning"""
        mapping = {
            "heavy_rainfall": "amber",
            "strong_wind": "blue",
            "high_tides": "cyan",
            "high_temperature": "red",
            "high_uv": "yellow",
            "small_aircraft": "orange",
        }
        return mapping.get(self.warning_type, "gray")