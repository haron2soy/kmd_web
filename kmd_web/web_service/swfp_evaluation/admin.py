
from django.contrib import admin
from .models import QuarterlyReport, EventTable

@admin.register(QuarterlyReport)
class QuarterlyReportAdmin(admin.ModelAdmin):
    list_display = ("year", "quarter", "title", "issue_date", "is_active")
    list_filter = ("year", "quarter", "is_active")
    search_fields = ("title",)
    ordering = ("-year", "-quarter")
    readonly_fields = ("created_at",)
    
@admin.register(EventTable)
class EventTableAdmin(admin.ModelAdmin):
    list_display = ("year", "quarter", "title", "issue_date", "is_active")
    list_filter = ("year", "quarter", "is_active")
    search_fields = ("title",)
    ordering = ("-year", "-quarter")
    readonly_fields = ("created_at",)
