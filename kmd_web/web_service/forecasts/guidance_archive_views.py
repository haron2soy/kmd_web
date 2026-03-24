import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings

BASE_DIR = os.path.join(settings.RSMC_DIR)  # numeric folders

@api_view(["GET"])
def guidance_files(request):
    year = request.GET.get("year")
    month = request.GET.get("month")  # expects numeric "03"
    file_type = request.GET.get("type")  # "Marine_Forecast" or "Easwfp_Discussion"

    if not all([year, month, file_type]):
        return Response({"error": "year, month, type required"}, status=400)

    month_path = os.path.join(BASE_DIR, year, month)  
    if not os.path.exists(month_path):
        return Response({"files": []})

    files = []
    # loop over day folders
    for day_folder in os.listdir(month_path):
        day_path = os.path.join(month_path, day_folder)
        if not os.path.isdir(day_path):
            continue

        for f in os.listdir(day_path):
            f_lower = f.lower()
            if not f_lower.endswith(".pdf"):
                continue
            if file_type == "Marine_Forecast" and "marine" in f_lower:
                files.append({
                    "name": f,
                    "url": f"{settings.MEDIA_URL}rsmc/{year}/{month.zfill(2)}/{day_folder}/{f}"
                })
            elif file_type == "Easwfp_Discussion" and "discussion" in f_lower:
                files.append({
                    "name": f,
                    "url": f"{settings.MEDIA_URL}rsmc/{year}/{month.zfill(2)}/{day_folder}/{f}"
                })

    return Response({"files": files})