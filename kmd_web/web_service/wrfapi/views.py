import os
import numpy as np
from netCDF4 import Dataset
from wrf import getvar
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET

DATA_DIR = "/data/wrf/"  # CHANGE THIS

NX = 264
NY = 300


def build_file_path(datetime_string: str):
    return os.path.join(DATA_DIR, f"wrfout_d01_{datetime_string}")


@require_GET
def get_field(request):
    """
    GET /api/wrf/field?datetime=2026-02-11_13:00:00&variable=T2
    """

    datetime_string = request.GET.get("datetime")
    variable = request.GET.get("variable", "T2")

    if not datetime_string:
        return JsonResponse({"error": "Missing datetime"}, status=400)

    file_path = build_file_path(datetime_string)

    if not os.path.exists(file_path):
        return JsonResponse({"error": "File not found"}, status=404)

    try:
        ncfile = Dataset(file_path)
        var = getvar(ncfile, variable, timeidx=0)
        data = var.values.astype(np.float32)
        ncfile.close()

        return HttpResponse(
            data.tobytes(),
            content_type="application/octet-stream"
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


'''from django.shortcuts import render
import os
import numpy as np
from netCDF4 import Dataset
from wrf import getvar
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET
from django.conf import settings

DATA_DIR = "/data/wrf/"  # change this


def build_file_path(datetime_string: str):
    return os.path.join(DATA_DIR, f"wrfout_d01_{datetime_string}")


@require_GET
def get_field(request):
    """
    GET /api/wrf/field?datetime=2026-02-11_13:00:00&variable=T2
    """

    datetime_string = request.GET.get("datetime")
    variable = request.GET.get("variable", "T2")

    if not datetime_string:
        return JsonResponse({"error": "datetime parameter required"}, status=400)

    file_path = build_file_path(datetime_string)

    if not os.path.exists(file_path):
        return JsonResponse({"error": "File not found"}, status=404)

    try:
        ncfile = Dataset(file_path)
        var = getvar(ncfile, variable, timeidx=0)
        data = var.values.astype(np.float32)
        ncfile.close()

        return HttpResponse(
            data.tobytes(),
            content_type="application/octet-stream"
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
'''