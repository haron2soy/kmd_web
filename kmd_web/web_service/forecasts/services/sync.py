import os
from datetime import date
from django.conf import settings
from forecasts.models import Forecast, ForecastCategory
from django.utils.timezone import now

def sync_today():
    today = now().date()

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

    if not os.path.exists(base_path):
        return False  # Nothing to sync

    short_range, _ = ForecastCategory.objects.get_or_create(
        slug="short-range",
        defaults={"name": "Short Range"}
    )

    files = os.listdir(base_path)

    for day in range(1, 6):
        image_name = f"rsmc0{day}.jpg"
        if image_name not in files:
            continue

        relative_path = f"rsmc/{year}/{month}/{day_folder}/{image_name}"

        Forecast.objects.update_or_create(
            category=short_range,
            day=day,
            issue_date=today,
            defaults={
                "title": f"Short Range Forecast - Day {day}",
                "map_image": relative_path,
                "is_active": True,
            }
        )

    return True