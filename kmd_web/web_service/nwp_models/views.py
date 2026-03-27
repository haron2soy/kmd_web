# nwp_models/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tasks import process_new_wrf
import os
import json
from django.http import FileResponse, HttpResponseBadRequest
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

MODEL_CONFIG = {
    "nwp_maps": {
        "BASE_MAP_DIR": settings.GENERATED_MAPS_DIR,
        "prefix": "d01",
        "variables": {
            "PRECIP": "rainfall_map.png",
            "T2": "temperature_map.png",
            "WIND": "wind_map.png",
        },
    },
    "eawrf_maps": {
        "BASE_MAP_DIR": settings.EAWRF_MAPS ,  
        "prefix": "d01",
        "variables": {
            "PRECIP": "rainfall_map.png",
            "WIND": "wind_map.png",
        },
    },
}

DOMAIN_MAP = {

    f"d{i:02d}": f"day{i}" for i in range(1, 7)
    
    }
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def notify_new_wrf(request):
    nc_path = request.data["path"]
    process_new_wrf.delay(nc_path)
    return Response({"status": "accepted"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_model_field(request, model_name):
    datetime = request.GET.get("datetime")
    variable = request.GET.get("variable")

    day = request.GET.get("day")  # day1, day2, day3
    REVERSE_DOMAIN_MAP = {v: k for k, v in DOMAIN_MAP.items()}

    prefix = REVERSE_DOMAIN_MAP.get(day)
    

    model = MODEL_CONFIG.get(model_name)
    if not model:
        return HttpResponseBadRequest("Invalid model")

    base_dir = model["BASE_MAP_DIR"]
    #prefix = model["prefix"]
    variable_map = model["variables"]
    
    if not prefix:
        return HttpResponseBadRequest("Invalid or missing day")
    
    run_id = f"{prefix}_{datetime}"
    folder = os.path.join(base_dir, run_id)

    if not os.path.exists(folder):
        return HttpResponseBadRequest(f"File not found")

    # target logical filename
    target_filename = variable_map.get(variable.upper())
    if not target_filename:
        return HttpResponseBadRequest("Invalid variable")

    #  search for any file ending with the target filename
    matched_file = None
    for f in os.listdir(folder):
        if f.endswith(target_filename):
            matched_file = f
            break

    if not matched_file:
        return HttpResponseBadRequest(f"No file found for variable {variable} in folder {folder}")

    file_path = os.path.join(folder, matched_file)
    #print("filePath:", file_path)

   
    bounds = [
        [33.0, -5.0],
        [42.0, -5.0],
        [42.0, 5.0],
        [33.0, 5.0],
    ]

    response = FileResponse(open(file_path, "rb"), content_type="image/png")

    # Important headers
    response["X-Domain-Bounds"] = json.dumps(bounds)
    response["Cache-Control"] = "public, max-age=3600"
    response["Access-Control-Expose-Headers"] = "X-Domain-Bounds"

    return response


# -------------------------------
# LIST MODELS ENDPOINT
# -------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_models(request):
    available_models = []

    for model_name, config in MODEL_CONFIG.items():
        base_dir = config.get("BASE_MAP_DIR")

        if not base_dir or not os.path.isdir(base_dir):
            continue

        detected_domains = set()

        # scan folders like d01_2026-03-26_00:00:00
        for folder in os.listdir(base_dir):
            parts = folder.split("_")
            if len(parts) < 2:
                continue

            domain = parts[0]  # d01, d02, d03

            if domain in DOMAIN_MAP:
                detected_domains.add(domain)

        status = "live" if detected_domains else "pending"

        available_models.append({
            "id": model_name,
            "name": model_name.upper(),
            "description": f"{model_name.upper()} model",
            "status": status,

            "apiEndpoint": f"/api/nwp_models/{model_name}/field/",

            "variables": list(config["variables"].keys()),

            # NEW: expose available forecast days
            "days": [
                {
                    "id": DOMAIN_MAP[d],
                    "label": DOMAIN_MAP[d].capitalize(),  # Day1
                    "prefix": d,
                }
                for d in sorted(detected_domains)
            ],
        })

    return Response(available_models)