import os
from django.http import JsonResponse
from django.conf import settings
import re
from rest_framework.decorators import api_view
from rest_framework.response import Response

BASE_DIR = os.path.join(settings.MEDIA_ROOT, "rsmc")


def list_years(request):
    
    try:
        years = sorted(os.listdir(BASE_DIR))
        print("years:", years)
        return JsonResponse({"years": years})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    print("years:", years)

def list_months(request):
    year = request.GET.get("year")
    if not year:
        return JsonResponse({"error": "year required"}, status=400)

    path = os.path.join(BASE_DIR, year)

    if not os.path.exists(path):
        return JsonResponse({"months": []})

    months = sorted(os.listdir(path))
    return JsonResponse({"months": months})


def list_days(request):
    year = request.GET.get("year")
    month = request.GET.get("month")

    if not year or not month:
        return JsonResponse({"error": "year & month required"}, status=400)

    path = os.path.join(BASE_DIR, year, month)

    if not os.path.exists(path):
        return JsonResponse({"days": []})

    days = sorted(os.listdir(path))
    return JsonResponse({"days": days})


def list_files(request):
    year = request.GET.get("year")
    month = request.GET.get("month")
    day = request.GET.get("day")

    if not all([year, month, day]):
        return JsonResponse({"error": "year, month, day required"}, status=400)

    path = os.path.join(BASE_DIR, year, month, day)

    if not os.path.exists(path):
        return JsonResponse({"files": []})

    files = []
    for f in os.listdir(path):
        files.append({
            "name": f,
            "url": f"/uploads/rsmc/{year}/{month}/{day}/{f}"
        })
    
    return JsonResponse({"files": files})
    

@api_view(["GET"])
def archive_files(request):
    year = request.GET.get('year')
    month = request.GET.get('month') 
    day = request.GET.get('day')
    file_type = request.GET.get('type')  # forecasts, discussions, tables
    
    if not all([year, month, day, file_type]):
        return Response({"error": "year, month, day, and type required"}, status=400)
    
    # Fix path construction - match your existing functions
    base_path = os.path.join(settings.MEDIA_ROOT, "rsmc", year, month, day.lower())
    
    if not os.path.exists(base_path):
        return Response({"files": []})
    
    all_files = os.listdir(base_path)
    
    # ✅ STRICT FILTERING BY EXACT FILENAME PATTERNS
    filtered_files = []
    if file_type == 'forecasts':
        # Only JPG forecast maps: rsmc01.jpg, rsmc02.jpg, etc.
        filtered_files = [f for f in all_files if re.match(r'rsmc0[1-5]\.(jpg|jpeg|png)$', f, re.IGNORECASE)]
    elif file_type == 'discussions':
        # Only discussion DOC files - EXACT names from your sample
        filtered_files = [f for f in all_files if any(pattern in f for pattern in [
            'Short_range_Discussion.doc', 
            'Medium_range_Discussion.doc'
        ])]
    elif file_type == 'tables':
        # Only risk/probability table DOC files - EXACT names from your sample
        filtered_files = [f for f in all_files if any(pattern in f for pattern in [
            'Short_range_Risk_table.doc',
            'Medium_range_Prob_table.doc'
        ])]
    
    files = []
    for filename in filtered_files:
        files.append({
            "name": filename,
            "url": f"/uploads/rsmc/{year}/{month}/{day.lower()}/{filename}"  # Fixed /uploads → /media
        })
    
    return Response({"files": files})

