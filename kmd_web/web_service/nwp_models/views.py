# nwp_models/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tasks import process_new_wrf
import os
import json
from django.http import FileResponse, HttpResponseBadRequest
from django.conf import settings


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
        "BASE_MAP_DIR": settings.WRF_DATA_DIR,  # or create EAWRF_DIR if needed
        "prefix": "d01",
        "variables": {
            "PRECIP": "rainfall_map.png",
            "WIND": "wind_map.png",
        },
    },
}

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



@api_view(["GET"])
def get_model_field(request, model_name):
    datetime = request.GET.get("datetime")
    variable = request.GET.get("variable")

    if not datetime or not variable:
        return HttpResponseBadRequest("Missing parameters")

    model = MODEL_CONFIG.get(model_name)
    if not model:
        return HttpResponseBadRequest("Invalid model")

    base_dir = model["BASE_MAP_DIR"]
    prefix = model["prefix"]
    variable_map = model["variables"]

    run_id = f"{prefix}_{datetime}"
    folder = os.path.join(base_dir, run_id)

    filename = variable_map.get(variable.upper())
    if not filename:
        return HttpResponseBadRequest("Invalid variable")

    file_path = os.path.join(folder, f"{filename}")

    if not os.path.exists(file_path):
        return HttpResponseBadRequest(f"File not found")

   
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


# -------------------------------
# LIST MODELS ENDPOINT
# -------------------------------
@api_view(["GET"])
def list_models(request):
    available_models = []

    for model_name, config in MODEL_CONFIG.items():
        base_dir = config.get("BASE_MAP_DIR")

        if base_dir and os.path.isdir(base_dir):
            # check recursively
            has_files = any(files for _, _, files in os.walk(base_dir))
            status = "live" if has_files else "pending"

            available_models.append({
                "id": model_name,
                "name": model_name.upper(),
                "description": f"{model_name.upper()} model",
                "status": status,

                # ✅ frontend route
                #"path": f"/nwp_models/{model_name}",

                # ✅ API endpoint
                "apiEndpoint": f"/api/nwp_models/{model_name}/field/",

                # ✅ expose variables (no need separate API)
                "variables": list(config["variables"].keys()),
            })

    return Response(available_models)