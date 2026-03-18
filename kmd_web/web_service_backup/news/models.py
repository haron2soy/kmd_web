from django.db import models
from django.utils import timezone
from django.utils.text import slugify

class News(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)  # we'll auto-generate
    content = models.TextField()
    published_at = models.DateTimeField(default=timezone.now)
    is_published = models.BooleanField(default=True)
    
    # Optional / improved
    author = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to="news/%Y/%m/", blank=True, null=True)
    
    # Very useful additions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-published_at"]
        verbose_name_plural = "news"
        indexes = [
            models.Index(fields=["published_at"]),
            models.Index(fields=["is_published", "published_at"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Optional: handle duplicate slugs
            original = self.slug
            count = 1
            while News.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original}-{count}"
                count += 1
        super().save(*args, **kwargs)


class Announcement(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    slug = models.SlugField(max_length=255, unique=True, blank=True)  # we'll auto-generate
    start_at = models.DateTimeField(default=timezone.now)
    end_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher number = more important")
    
    # Recommended additions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-priority", "-start_at"]
        verbose_name_plural = "announcements"
    
    def __str__(self):
        return f"{self.title} ({'Active' if self.is_active else 'Inactive'})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Optional: handle duplicate slugs
            original = self.slug
            count = 1
            while News.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original}-{count}"
                count += 1
        super().save(*args, **kwargs)
    @property
    def is_currently_active(self):
        """Helper to check if announcement should be shown right now"""
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.start_at:
            return False
        if self.end_at and now > self.end_at:
            return False
        return True