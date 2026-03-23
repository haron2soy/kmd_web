import os
from datetime import timedelta
from django.utils.timezone import now
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view

from forecasts.models import Forecast, ForecastCategory

# -----------------------------
# Filename generators
# -----------------------------
def marine_daily_filename(day, month, year):
    return f"Daily_Marine_Forecast_valid_{day}_{month}_{year}.pdf"

def marine_seven_day_filename(day, month, year):
    today = now().date()
    start_date = today + timedelta(days=1)
    end_date = today + timedelta(days=7)
    start = f"{start_date.day:02d}_{start_date.month:02d}_{start_date.year}"
    end = f"{end_date.day:02d}_{end_date.month:02d}_{end_date.year}"
    return f"Seven_Day_Marine_Forecast_valid_{start}_to_{end}.pdf"

def easwfp_daily_filename(day, month, year):
    return f"Easwfp_Discussion_valid_{day}_{month}_{year}.pdf"

# -----------------------------
# Slug mapping
# -----------------------------
FILENAME_PATTERNS = {
    "short-discussion": lambda d, m, y: "RSMC_Guidance_Short_range_Discussion.doc",
    "medium-discussion": lambda d, m, y: "RSMC_Guidance_Medium_range_Discussion.doc",
    "medium-risktable": lambda d, m, y: "RSMC_Guidance_Medium_range_Prob_table.doc",
    "short-risktable": lambda d, m, y: "RSMC_Guidance_Short_range_Risk_table.doc",
    "marine-forecast-daily": marine_daily_filename,
    "marine-forecast-seven-days": marine_seven_day_filename,
    "easwfp-discussion-daily": easwfp_daily_filename,
}

# -----------------------------
# API endpoint
# -----------------------------
@api_view(["GET"])
def guidance_documents(request):
    slug = request.GET.get("slug")
    if not slug:
        return Response({"error": "Missing slug parameter"}, status=400)

    if slug not in FILENAME_PATTERNS:
        return Response({"error": f"Invalid slug. Available: {', '.join(FILENAME_PATTERNS.keys())}"},
                        status=400)

    today = now().date()
    day = f"{today.day:02d}"
    month = f"{today.month:02d}"
    year = str(today.year)

    # -----------------------------
    # 1️⃣ Database lookup
    # -----------------------------
    forecast = Forecast.objects.filter(
        content_type="document",
        slug=slug,
        issue_date=today,
        is_active=True
    ).first()

    if forecast:
        _, ext = os.path.splitext(forecast.file_path)
        file_type = ext.lstrip(".").lower()
        return Response({
            "document": forecast.file_path,
            "url": f"{settings.STORAGE_BASE_DIR}{forecast.file_path}",
            "slug": slug,
            "date": forecast.issue_date.strftime("%Y-%m-%d"),
            "filename": os.path.basename(forecast.file_path),
            "file_type": file_type,
        })

    # -----------------------------
    # 2️⃣ Filesystem fallback
    # -----------------------------
    base_path = os.path.join(settings.RSMC_DIR, year, month, day)
    filename = FILENAME_PATTERNS[slug](day, month, year)
    full_path = os.path.join(base_path, filename)

    if not os.path.exists(full_path):
        return Response({"error": f"{filename} not found in {base_path}"}, status=404)

    # -----------------------------
    # 3️⃣ Save to DB
    # -----------------------------
    category, _ = ForecastCategory.objects.get_or_create(
        slug="guidance",
        defaults={"name": "Guidance Documents"}
    )

    db_file_path = os.path.join("rsmc", year, month, day, filename)
    forecast, _ = Forecast.objects.update_or_create(
        category=category,
        slug=slug,
        issue_date=today,
        defaults={
            "title": slug.replace("-", " ").title(),
            "file_path": db_file_path,
            "is_active": True,
        }
    )

    _, ext = os.path.splitext(db_file_path)
    file_type = ext.lstrip(".").lower()

    return Response({
        "document": db_file_path,
        "url": f"{settings.STORAGE_BASE_DIR}{db_file_path}",
        "slug": slug,
        "date": forecast.issue_date.strftime("%Y-%m-%d"),
        "filename": filename,
        "file_type": file_type,
    })