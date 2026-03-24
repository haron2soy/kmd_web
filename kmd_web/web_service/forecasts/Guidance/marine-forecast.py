from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
from forecasts.models import Forecast, ForecastCategory
import os

# Mapping of slugs to exact filename patterns
FILENAME_PATTERNS = {
    'marine-forecast-daily': 'daily-marine-forecast-valid-03-03-2026.pdf',
    'marine-forecast-weekly': 'seven-day-marine-forecast-valid-09-03-2026-to-15-03-2026.pdf',
}

@api_view(["GET"])
def marine_documents(request):
    slug = request.GET.get("slug")

    if not slug:
        return Response({"error": "Missing slug parameter"}, status=400)

    if slug not in FILENAME_PATTERNS:
        return Response({
            "error": f"Invalid slug. Available: {', '.join(FILENAME_PATTERNS.keys())}"
        }, status=400)

    today = now().date()
    year = str(today.year)
    #month = f"{today.month:02d}"  # numeric month
    month = calendar.month_name[today.month]  # e.g., "March"
    #day_folder = f"{today.day:02d}"  # numeric day folder
    day_folder = today.strftime("%b-%d").lower()  # "mar-23"

    # 1️⃣ Try database first
    forecast = Forecast.objects.filter(
        content_type='document',
        slug=slug,
        issue_date=today,
        is_active=True
    ).first()

    if forecast:
        return Response({
            "document": forecast.file.url,
            "slug": slug,
            "date": forecast.issue_date.strftime("%Y-%m-%d"),
            "filename": os.path.basename(forecast.file.name)
        })

    # 2️⃣ Fallback to filesystem
    base_path = os.path.join(settings.RSMC_DIR, year, month, day_folder)
    print("base_path:", base_path)
    filename = FILENAME_PATTERNS[slug]
    full_path = os.path.join(base_path, filename)
    print("full_path:", full_path)
    if not os.path.exists(full_path):
        return Response({"error": f"{filename} not found in {day_folder}"}, status=404)

    # 3️⃣ Create or update DB record
    category, _ = ForecastCategory.objects.get_or_create(
        slug="marine-forecast",
        defaults={"name": "Marine Documents"}
    )

    file_relative_path = os.path.join("rsmc", year, month, day_folder, filename)

    forecast, _ = Forecast.objects.update_or_create(
        category=category,
        slug=slug,
        issue_date=today,
        defaults={
            "title": slug.replace('-', ' ').title(),
            "file": file_relative_path,
            "is_active": True,
        }
    )

    return Response({
        "document": forecast.file.url,
        "slug": slug,
        "date": forecast.issue_date.strftime("%Y-%m-%d"),
        "filename": filename
    })