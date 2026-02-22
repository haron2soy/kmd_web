from django.db import models


class ForecastCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Forecast(models.Model):
    DAY_CHOICES = [
        (1, "Day 1"),
        (2, "Day 2"),
        (3, "Day 3"),
        (4, "Day 4"),
        (5, "Day 5"),
    ]

    category = models.ForeignKey(
        ForecastCategory,
        on_delete=models.CASCADE,
        related_name="forecasts"
    )

    day = models.PositiveSmallIntegerField(choices=DAY_CHOICES)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # 🔥 IMPORTANT: no upload_to because files already exist
    map_image = models.FileField(max_length=500)
    discussion_doc = models.FileField(max_length=500, blank=True, null=True)
    risk_table_doc = models.FileField(max_length=500, blank=True, null=True)

    issue_date = models.DateField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issue_date"]
        unique_together = ("category", "day", "issue_date")

    def __str__(self):
        return f"{self.category.name} - Day {self.day} ({self.issue_date})"