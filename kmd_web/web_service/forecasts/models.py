from django.db import models


class ForecastCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Forecast(models.Model):
    DAY_CHOICES = [
        ("day1", "Day 1"),
        ("day2", "Day 2"),
        ("day3", "Day 3"),
    ]

    category = models.ForeignKey(
        ForecastCategory,
        on_delete=models.CASCADE,
        related_name="forecasts"
    )

    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    map_image = models.ImageField(upload_to="forecasts/maps/")
    discussion_doc = models.FileField(upload_to="forecasts/discussions/", blank=True)
    risk_table_doc = models.FileField(upload_to="forecasts/risk_tables/", blank=True)

    issue_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-issue_date"]

    def __str__(self):
        return f"{self.title} ({self.issue_date})"

# forecasts/models.py
'''issues to solve
from django.db import models

class Forecast(models.Model):

    DAY_CHOICES = [
        ("day1", "Day 1"),
        ("day2", "Day 2"),
    ]

    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    issue_date = models.DateField()

    map_image = models.ImageField(upload_to="forecasts/maps/")
    discussion_doc = models.FileField(upload_to="forecasts/discussions/")
    risk_table_doc = models.FileField(upload_to="forecasts/risk_tables/")

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issue_date"]

    def __str__(self):
        return f"{self.day} - {self.issue_date}"
    '''