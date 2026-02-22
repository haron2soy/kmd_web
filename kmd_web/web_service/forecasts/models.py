from django.db import models

class ForecastCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Forecast(models.Model):
    # Keep existing day-based structure for images
    DAY_CHOICES = [
        (1, "Day 1"),
        (2, "Day 2"),
        (3, "Day 3"),
        (4, "Day 4"),
        (5, "Day 5"),
    ]
    
    # Document type slugs (for .doc files)
    DOC_TYPE_CHOICES = [
        ('short-discussion', 'Short Range Discussion'),
        ('medium-discussion', 'Medium Range Discussion'),
        ('medium-risktable', 'Medium Range Risk Table'),
        ('short-risktable', 'Short Range Risk Table'),
    ]

    category = models.ForeignKey(
        ForecastCategory,
        on_delete=models.CASCADE,
        related_name="forecasts"
    )

    # Use content_type to distinguish: 'image' vs 'document'
    content_type = models.CharField(
        max_length=20,
        choices=[
            ('image', 'Map Image'),
            ('document', 'Discussion/Risk Table'),
        ]
    )

    # day = for images (rsmc01.jpg, rsmc02.jpg, etc.)
    day = models.PositiveSmallIntegerField(choices=DAY_CHOICES, null=True, blank=True)
    
    # slug = for documents (short-discussion, medium-risktable, etc.)
    slug = models.CharField(max_length=50, choices=DOC_TYPE_CHOICES, null=True, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Single file field for both images AND documents
    file = models.FileField(max_length=500)  # 🔥 no upload_to - files already exist
    issue_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issue_date"]
        # Unique constraint: either (category, day, issue_date) OR (category, slug, issue_date)
        constraints = [
            models.UniqueConstraint(
                fields=['category', 'day', 'issue_date'], 
                condition=models.Q(content_type='image'),
                name='unique_image_forecast'
            ),
            models.UniqueConstraint(
                fields=['category', 'slug', 'issue_date'], 
                condition=models.Q(content_type='document'),
                name='unique_document_forecast'
            ),
        ]

    def __str__(self):
        if self.content_type == 'image':
            return f"{self.category.name} - Day {self.day} ({self.issue_date})"
        return f"{self.get_slug_display()} ({self.issue_date})"
