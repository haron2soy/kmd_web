from django.contrib import admin

from django.contrib import admin
from .models import News, Announcement

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'published_at', 'is_published', 'author')
    prepopulated_fields = {"slug": ("title",)}  # optional

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_at', 'end_at', 'is_active', 'priority')
    prepopulated_fields = {"slug": ("title",)}  # optional