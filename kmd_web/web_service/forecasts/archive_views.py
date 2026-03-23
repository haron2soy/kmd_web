import os
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Use numeric RSMC_DIR from settings
BASE_DIR = settings.RSMC_DIR


def safe_listdir(path):
    """Return sorted list or empty if path doesn't exist."""
    return sorted(os.listdir(path)) if os.path.exists(path) else []


@api_view(["GET"])
def list_years(request):
    return Response({"years": safe_listdir(BASE_DIR)})


@api_view(["GET"])
def list_months(request):
    year = request.GET.get("year")
    if not year:
        return Response({"error": "year required"}, status=400)
    return Response({"months": safe_listdir(os.path.join(BASE_DIR, year))})


@api_view(["GET"])
def list_days(request):
    year = request.GET.get("year")
    month = request.GET.get("month")
    if not all([year, month]):
        return Response({"error": "year & month required"}, status=400)
    return Response({"days": safe_listdir(os.path.join(BASE_DIR, year, month))})


@api_view(["GET"])
def list_files(request):
    year = request.GET.get("year")
    month = request.GET.get("month")
    day = request.GET.get("day")
    if not all([year, month, day]):
        return Response({"error": "year, month, day required"}, status=400)

    path = os.path.join(BASE_DIR, year, month, day)
    files = [
        {
            "name": f,
            "url": f"{settings.STORAGE_BASE_DIR}rsmc/{year}/{month}/{day}/{f}"
        }
        for f in safe_listdir(path)
    ]
    return Response({"files": files})


@api_view(["GET"])
def archive_files(request):
    """Return files filtered by type, sorted by date descending and filename ascending."""
    year = request.GET.get("year")
    month = request.GET.get("month")
    file_type = request.GET.get("type")  # forecasts, discussions, tables

    if not all([year, month, file_type]):
        return Response({"error": "year, month and type required"}, status=400)

    base_path = os.path.join(BASE_DIR, year, month)
    files = []

    for day in safe_listdir(base_path):
        day_path = os.path.join(base_path, day)
        if not os.path.isdir(day_path):
            continue

        iso_date = f"{year}-{month}-{day}"

        for filename in safe_listdir(day_path):
            f_lower = filename.lower()
            match = False

            if file_type == "forecasts" and f_lower.startswith("rsmc0") and f_lower.endswith((".jpg", ".jpeg", ".png")):
                match = True
            elif file_type == "discussions" and f_lower.endswith((".doc", ".docx", ".pdf")) and "discussion" in f_lower:
                match = True
            elif file_type == "tables" and f_lower.endswith((".doc", ".docx", ".pdf")) and "table" in f_lower:
                match = True

            if match:
                files.append({
                    "name": filename,
                    "url": f"{settings.STORAGE_BASE_DIR}rsmc/{year}/{month}/{day}/{filename}",
                    "date": iso_date
                })

    # Sort descending by date, then ascending by filename
    files.sort(key=lambda x: (x["date"], x["name"]), reverse=True)
    return Response({"files": files})