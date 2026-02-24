from django.db import models


class QuarterlyReport(models.Model):
    year = models.PositiveIntegerField()
    quarter = models.PositiveSmallIntegerField()  # 1–4

    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)  # relative to MEDIA_ROOT

    issue_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("year", "quarter")
        ordering = ["-year", "-quarter"]

    def __str__(self):
        return f"{self.year} - Q{self.quarter}"

    def get_file_url(self):
        from django.conf import settings
        return f"{settings.MEDIA_URL}{self.file_path}"

class EventTable(models.Model):
    year = models.PositiveIntegerField()
    quarter = models.PositiveSmallIntegerField()

    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)

    issue_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("year", "quarter")
        ordering = ["-year", "-quarter"]

    def __str__(self):
        return f"Event Table - {self.year} Q{self.quarter}"

    def get_file_url(self):
        from django.conf import settings
        return f"{settings.MEDIA_URL}{self.file_path}"