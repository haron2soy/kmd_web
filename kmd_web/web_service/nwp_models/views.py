# nwp_models/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tasks import process_new_wrf
import os
import json
from django.http import FileResponse, HttpResponseBadRequest
from django.conf import settings


BASE_MAP_DIR = "/home/haron/kmd/generated_maps"

@api_view(["POST"])
def notify_new_wrf(request):
    nc_path = request.data["path"]
    process_new_wrf.delay(nc_path)
    return Response({"status": "accepted"})

@api_view(["GET"])
def get_wrf_metadata(request):
    datetime = request.GET.get("file")

    if not datetime:
        return Response({"error": "Missing file parameter"}, status=400)

    # ⚠️ Replace later with dynamic extraction from NetCDF
    bounds = [
        [33.0, -5.0],
        [42.0, -5.0],
        [42.0, 5.0],
        [33.0, 5.0],
    ]

    return Response({
        "bounds": bounds,
        "projection": "EPSG:4326",
    })

'''def get_wrf_field(request):
    datetime = request.GET.get("datetime")
    variable = request.GET.get("variable")

    if not datetime or not variable:
        return HttpResponseBadRequest("Missing parameters")

    run_id = datetime
    folder = os.path.join(BASE_MAP_DIR, run_id)

    # Map variable → filename
    variable_map = {
        "PRECIP": "rainfall_map.png",
        "T2": "temperature_map.png",
        "WIND": "wind_map.png",
    }

    filename = variable_map.get(variable)

    if not filename:
        return HttpResponseBadRequest("Invalid variable")

    file_path = os.path.join(folder, f"{run_id}_{filename}")

    if not os.path.exists(file_path):
        return HttpResponseBadRequest("File not found")

    # 🔥 IMPORTANT: Hardcoded bounds (replace later with dynamic)
    bounds = [
        [33.0, -5.0],   # SW
        [42.0, -5.0],   # SE
        [42.0, 5.0],    # NE
        [33.0, 5.0],    # NW
    ]

    response = FileResponse(open(file_path, "rb"), content_type="image/png")
    response["X-Domain-Bounds"] = json.dumps(bounds)

    return response'''

def get_wrf_field(request):
    datetime = request.GET.get("datetime")
    variable = request.GET.get("variable")

    if not datetime or not variable:
        return HttpResponseBadRequest("Missing parameters")

    run_id = f"d01_{datetime}"
    folder = os.path.join(BASE_MAP_DIR, run_id)

    variable_map = {
        "PRECIP": "rainfall_map.png",
        "T2": "temperature_map.png",
        "WIND": "wind_map.png",
    }

    filename = variable_map.get(variable.upper())
    if not filename:
        return HttpResponseBadRequest("Invalid variable")

    file_path = os.path.join(folder, f"{run_id}_{filename}")

    if not os.path.exists(file_path):
        return HttpResponseBadRequest(f"File not found: {file_path}")

    bounds = [
        [33.0, -5.0],
        [42.0, -5.0],
        [42.0, 5.0],
        [33.0, 5.0],
    ]

    response = FileResponse(open(file_path, "rb"), content_type="image/png")

    # 🔥 Important headers
    response["X-Domain-Bounds"] = json.dumps(bounds)
    response["Cache-Control"] = "public, max-age=3600"
    response["Access-Control-Expose-Headers"] = "X-Domain-Bounds"

    return response

