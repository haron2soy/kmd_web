from datetime import timedelta
import os

from django.utils.timezone import now
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view

from forecasts.models import Forecast, ForecastCategory

# -----------------------------
# Filename generators
# -----------------------------
def marine_daily_filename(day, month, year):
    return f"Daily_Marine_Forecast_valid_{day}_{month.title()}_{year}.docx"

def marine_seven_day_filename(day, month, year):
    today = now().date()
    start_date = today + timedelta(days=1)
    end_date = today + timedelta(days=7)
    start = f"{start_date.day:02d}_{start_date.strftime('%B')}_{start_date.year}"
    end = f"{end_date.day:02d}_{end_date.strftime('%B')}_{end_date.year}"
    return f"Seven_Day_Marine_Forecast_valid_{start}_to_{end}.docx"

def easfwp_daily_filename(day, month, year):
    return f"Easfwp_Discussion_valid_{day}_{month.title()}_{year}.ppt"

# Mapping slugs to filename functions
FILENAME_PATTERNS = {
    "short-discussion": lambda d, m, y: "RSMC_Guidance_Short_range_Discussion.doc",
    "medium-discussion": lambda d, m, y: "RSMC_Guidance_Medium_range_Discussion.doc",
    "medium-risktable": lambda d, m, y: "RSMC_Guidance_Medium_range_Prob_table.doc",
    "short-risktable": lambda d, m, y: "RSMC_Guidance_Short_range_Risk_table.doc",
    "marine-forecast-daily": marine_daily_filename,
    "marine-forecast-seven-days": marine_seven_day_filename,
    "easfwp-discussion-daily": easfwp_daily_filename,
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
        return Response({
            "error": f"Invalid slug. Available: {', '.join(FILENAME_PATTERNS.keys())}"
        }, status=400)

    today = now().date()
    day = today.strftime("%d")
    month_title = today.strftime("%B")
    year = today.year

    # -----------------------------
    # 1️⃣ Check database
    # -----------------------------
    forecast = Forecast.objects.filter(
        content_type='document',
        slug=slug,
        issue_date=today,
        is_active=True
    ).first()

    if forecast:
        _, ext = os.path.splitext(forecast.file_path)
        file_type = ext.lstrip(".").lower()
        return Response({
            "document": forecast.file_path,
            "slug": slug,
            "date": forecast.issue_date.strftime("%Y-%m-%d"),
            "filename": os.path.basename(forecast.file_path),
            "file_type": file_type,
        })

    # -----------------------------
    # 2️⃣ Fallback to filesystem
    # -----------------------------
    day_folder = today.strftime("%b-%d").lower()
    base_path = os.path.join(settings.MEDIA_ROOT, "rsmc", str(year), month_title.lower(), day_folder)

    filename = FILENAME_PATTERNS[slug](day, month_title, year)
    full_path = os.path.join(base_path, filename)

    print("----- DEBUG GUIDANCE LOOKUP -----")
    print("Slug:", slug)
    print("Generated filename:", filename)
    print("Base path:", base_path)
    print("Full path:", full_path)
    print("Exists:", os.path.exists(full_path))
    print("----------------------------------")

    if not os.path.exists(full_path):
        return Response({"error": f"{filename} not found in {day_folder}"}, status=404)

    # -----------------------------
    # 3️⃣ Create or update DB record
    # -----------------------------
    category, _ = ForecastCategory.objects.get_or_create(
        slug="guidance",
        defaults={"name": "Guidance Documents"}
    )

    db_file_path = os.path.join("rsmc", str(year), month_title.lower(), day_folder, filename)
    forecast, _ = Forecast.objects.update_or_create(
        category=category,
        slug=slug,
        issue_date=today,
        defaults={
            "title": slug.replace('-', ' ').title(),
            "file_path": db_file_path,
            "is_active": True,
        }
    )

    _, ext = os.path.splitext(db_file_path)
    file_type = ext.lstrip(".").lower()

    return Response({
        "document": db_file_path,
        "slug": slug,
        "date": forecast.issue_date.strftime("%Y-%m-%d"),
        "filename": filename,
        "file_type": file_type,
    })