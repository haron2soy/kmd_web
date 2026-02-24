from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
from forecasts.models import Forecast, ForecastCategory
import os

# Mapping of slugs to exact filename patterns
FILENAME_PATTERNS = {
    'short-discussion': 'RSMC_Guidance_Short_range_Discussion.doc',
    'medium-discussion': 'RSMC_Guidance_Medium_range_Discussion.doc',
    'medium-risktable': 'RSMC_Guidance_Medium_range_Prob_table.doc',
    'short-risktable': 'RSMC_Guidance_Short_range_Risk_table.doc',
}

@api_view(["GET"])
def guidance_documents(request):
    slug = request.GET.get("slug")

    # Validate slug parameter
    if not slug:
        return Response({"error": "Missing slug parameter"}, status=400)

    if slug not in FILENAME_PATTERNS:
        return Response({
            "error": f"Invalid slug. Available: {', '.join(FILENAME_PATTERNS.keys())}"
        }, status=400)

    today = now().date()

    # 1️⃣ Try database first
    forecast = Forecast.objects.filter(
        content_type='document',
        slug=slug,
        issue_date=today,
        is_active=True
    ).first()

    if forecast:
        return Response({
            "document": forecast.file.url if hasattr(forecast, 'file') else forecast.file.url,
            "slug": slug,
            "date": forecast.issue_date.strftime("%Y-%m-%d"),
            "filename": os.path.basename(forecast.file.name) if hasattr(forecast, 'file') else os.path.basename(forecast.file.name)
        })

    # 2️⃣ Fallback to filesystem
    year = str(today.year)
    month = today.strftime("%B").lower()
    day_folder = today.strftime("%b-%d").lower()

    base_path = os.path.join(
        settings.MEDIA_ROOT,
        "rsmc",
        year,
        month,
        day_folder
    )

    filename = FILENAME_PATTERNS[slug]
    full_path = os.path.join(base_path, filename)
    
    
    if not os.path.exists(full_path):
        return Response({"error": f"{filename} not found in {day_folder}"}, status=404)

    # 3️⃣ Create or update DB record
    category, _ = ForecastCategory.objects.get_or_create(
        slug="guidance",
        defaults={"name": "Guidance Documents"}
    )

    forecast, _ = Forecast.objects.update_or_create(
        category=category,
        slug=slug,
        issue_date=today,
        defaults={
            "title": f"{slug.replace('-', ' ').title()}",
            "file": f"rsmc/{year}/{month}/{day_folder}/{filename}",
            "is_active": True,
        }
    )

    return Response({
        "document": forecast.file.url if hasattr(forecast, 'file') else forecast.file.url,
        "slug": slug,
        "date": forecast.issue_date.strftime("%Y-%m-%d"),
        "filename": filename
    })
