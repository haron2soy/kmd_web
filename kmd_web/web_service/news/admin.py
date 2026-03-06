from django.contrib import admin

from django.contrib import admin
from .models import News, Announcement

from .alerts_models import Warning
from django.utils.html import format_html

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'published_at', 'is_published', 'author')
    prepopulated_fields = {"slug": ("title",)}  # optional

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_at', 'end_at', 'is_active', 'priority')
    prepopulated_fields = {"slug": ("title",)}  # optional
    

@admin.register(Warning)
class WarningAdmin(admin.ModelAdmin):
    list_display = ("title", "warning_type", "priority", "is_active", "start_at", "end_at", "icon_preview", "color_preview")
    list_filter = ("warning_type", "is_active")
    search_fields = ("title", "message")
    ordering = ("-priority", "-start_at")
    readonly_fields = ("slug", "icon_preview", "color_preview")

    fieldsets = (
        (None, {
            "fields": ("title", "slug", "warning_type", "message", "priority", "is_active")
        }),
        ("Timing", {
            "fields": ("start_at", "end_at")
        }),
        ("Preview", {
            "fields": ("icon_preview", "color_preview")
        }),
    )

    def icon_preview(self, obj):
        """Show icon name (or emoji) in admin"""
        # Optional: Map Lucide icon names to emojis for quick preview
        ICON_EMOJI = {
            "CloudRain": "🌧️",
            "Wind": "💨",
            "Anchor": "⚓",
            "Sun": "☀️",
            "SunHigh": "🌞",
            "Airplane": "✈️",
            "AlertTriangle": "⚠️",
        }
        return format_html("<span style='font-size:1.5em'>{}</span>", ICON_EMOJI.get(obj.icon, "⚠️"))
    icon_preview.short_description = "Icon"

    def color_preview(self, obj):
        """Show Tailwind color as a badge"""
        color_map = {
            "amber": "#f59e0b",
            "blue": "#3b82f6",
            "cyan": "#06b6d4",
            "red": "#ef4444",
            "yellow": "#facc15",
            "orange": "#f97316",
            "gray": "#9ca3af",
        }
        color_hex = color_map.get(obj.color, "#9ca3af")
        return format_html(
            '<span style="display:inline-block;width:20px;height:20px;background-color:{};border-radius:50%;"></span>',
            color_hex
        )
    color_preview.short_description = "Color Badge"