from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
from forecasts.models import Forecast, ForecastCategory
import os

MAX_DAY = 5


@api_view(["GET"])
def latest_forecast(request):
    day = request.GET.get("day")

    # Validate day parameter
    if not day:
        return Response({"error": "Missing day parameter"}, status=400)

    try:
        day_int = int(day)
    except ValueError:
        return Response({"error": "Invalid day"}, status=400)

    if day_int < 1 or day_int > MAX_DAY:
        return Response({"error": f"Day must be between 1 and {MAX_DAY}"}, status=400)

    today = now().date()

    # 1️⃣ Try database first
    forecast = Forecast.objects.filter(
        day=day_int,
        issue_date=today,
        is_active=True
    ).first()

    if forecast:
        return Response({
            "image": request.build_absolute_uri(forecast.map_image.url),
            "date": forecast.issue_date.strftime("%Y-%m-%d"),
            "day": day_int
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

    filename = f"rsmc0{day_int}.jpg"
    full_path = os.path.join(base_path, filename)
    print("full-path:", full_path)
    if not os.path.exists(full_path):
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
            "map_image": f"rsmc/{year}/{month}/{day_folder}/{filename}",
            "is_active": True,
        }
    )

    return Response({
        "image": request.build_absolute_uri(forecast.map_image.url),
        "date": forecast.issue_date.strftime("%Y-%m-%d"),
        "day": day_int
    })