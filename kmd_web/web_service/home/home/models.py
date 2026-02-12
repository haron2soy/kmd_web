from django.db import models

from django.db import models

class Home(models.Model):
    slug = models.SlugField(
        max_length=150,
        unique=True,
        help_text="URL identifier, e.g. about-rsmc"
    )
    title = models.CharField(max_length=255)
    content = models.TextField(help_text="HTML content")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Meta:
    ordering = ["title"]

    def __str__(self):
        return self.title

class Page(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title