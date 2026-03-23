from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
from forecasts.models import Forecast, ForecastCategory
import os
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes



from django.utils.timezone import now


MAX_DAY = 5

def get_forecast_path(day_int):
    """Build filesystem path for forecast image based on today and day_int."""
    today = now().date()
    year = str(today.year)
    month = f"{today.month:02d}"  # zero-padded number
    day_folder = f"{today.day:02d}"  # zero-padded number

    base_path = settings.STORAGE_BASE_DIR / "rsmc" / year / month / day_folder
    filename = f"rsmc0{day_int}.jpg"
    full_path = base_path / filename
    print("another path:", full_path)
    return full_path, f"rsmc/{year}/{month}/{day_folder}/{filename}"

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def latest_forecast(request):
    """Return the latest forecast image either from DB or filesystem."""
    day = request.GET.get("day")

    # Validate day
    try:
        day_int = int(day)
        if day_int < 1 or day_int > MAX_DAY:
            raise ValueError()
    except (TypeError, ValueError):
        return Response({"error": f"Day must be an integer between 1 and {MAX_DAY}"}, status=400)

    today = now().date()

    # 1️⃣ Check database first
    forecast = Forecast.objects.filter(
        content_type="image",
        day=day_int,
        issue_date=today,
        is_active=True
    ).first()
    print("beforeDB HIT:", forecast)
    if forecast:
        print("DB HIT:", forecast.file_path)
        return Response({
            "image": f"{forecast.file_path}".replace("//", "/"),
            "date": forecast.issue_date.strftime("%Y-%m-%d"),
            "day": day_int
        })

    # 2️⃣ Fallback to filesystem
    full_path, db_path = get_forecast_path(day_int)
    print("full path:", full_path)
    if not os.path.exists(full_path):
        print("Looking for file at:", full_path)
        return Response({"error": "Forecast image not found"}, status=404)

    # 3️⃣ Create or update DB record
    category, _ = ForecastCategory.objects.get_or_create(
        slug="short-range",
        defaults={"name": "Short Range"}
    )

    forecast, _ = Forecast.objects.update_or_create(
        category=category,
        day=day_int,
        issue_date=today,
        defaults={
            "title": f"Short Range Forecast - Day {day_int}",
            "file_path": db_path,
            "is_active": True,
        }
    )

    return Response({
        "image": db_path,
        "date": today.strftime("%Y-%m-%d"),
        "day": day_int
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_forecasts(request):
    """
    Return all forecast images (Day 1–5) using same logic as latest_forecast:
    - Check DB first
    - Fallback to filesystem
    - Ensure DB is populated
    """

    today = now().date()
    images = []

    # Ensure category exists
    category, _ = ForecastCategory.objects.get_or_create(
        slug="short-range",
        defaults={"name": "Short Range"}
    )

    for day_int in range(1, MAX_DAY + 1):

        # 1️⃣ Check DB
        forecast = Forecast.objects.filter(
            content_type="image",
            day=day_int,
            issue_date=today,
            is_active=True
        ).first()

        if forecast:
            images.append({
                "day": day_int,
                "image": f"{forecast.file_path}".replace("//", "/")
            })
            continue

        # 2️⃣ Fallback to filesystem
        full_path, db_path = get_forecast_path(day_int)

        if not os.path.exists(full_path):
            # Skip missing files instead of breaking everything
            continue

        # 3️⃣ Create/update DB record
        forecast, _ = Forecast.objects.update_or_create(
            category=category,
            day=day_int,
            issue_date=today,
            defaults={
                "title": f"Short Range Forecast - Day {day_int}",
                "file_path": db_path,
                "is_active": True,
                "content_type": "image",
            }
        )

        images.append({
            "day": day_int,
            "image": db_path
        })

    return Response({
        "date": today.strftime("%Y-%m-%d"),
        "count": len(images),
        "images": images
    })