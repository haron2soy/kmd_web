import os
import numpy as np
import xarray as xr
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views import View
from PIL import Image


class WRFFieldView(View):
    def get(self, request):
        dt = request.GET.get("datetime")
        variable = request.GET.get("variable", "T2")

        if not dt:
            return JsonResponse({"error": "Missing datetime"}, status=400)

        # Path to WRF file
        nc_file = os.path.join(
            settings.BASE_DIR,
            "..", "..", "..",
            "nwp_models_data",
            f"wrfout_d01_{dt}"
        )
        print("hey:", nc_file)
        if not os.path.exists(nc_file):
            return JsonResponse({"error": "File not found"}, status=404)

        try:
            ds = xr.open_dataset(nc_file)

            # -------------------------
            # VARIABLE HANDLING
            # -------------------------
            if variable == "T2":
                data = ds["T2"].isel(Time=0).values - 273.15  # K → °C
                vmin, vmax = -20, 45

            elif variable == "PRECIP":
                rainc = ds["RAINC"].isel(Time=0)
                rainnc = ds["RAINNC"].isel(Time=0)
                data = (rainc + rainnc).values  # cumulative
                vmin, vmax = 0, 50

            else:
                return JsonResponse({"error": "Unsupported variable"}, status=400)

            # -------------------------
            # HANDLE NANs
            # -------------------------
            data = np.array(data, dtype=np.float32)
            data = np.where(np.isfinite(data), data, np.nan)

            ny, nx = data.shape

            # Flip vertically (WRF → image coords)
            data = np.flipud(data)

            # -------------------------
            # COLOR MAPPING
            # -------------------------
            def scale(val):
                if np.isnan(val):
                    return (0, 0, 0, 0)

                t = (val - vmin) / (vmax - vmin)
                t = np.clip(t, 0, 1)

                r = int(255 * t)
                g = 0
                b = int(255 * (1 - t))

                return (r, g, b, 255)

            rgba = np.zeros((ny, nx, 4), dtype=np.uint8)

            for i in range(ny):
                for j in range(nx):
                    rgba[i, j] = scale(data[i, j])

            # -------------------------
            # CREATE PNG
            # -------------------------
            img = Image.fromarray(rgba, mode="RGBA")

            response = HttpResponse(content_type="image/png")
            img.save(response, format="PNG")

            # -------------------------
            # SEND DOMAIN METADATA
            # -------------------------
            lats = ds["XLAT"].isel(Time=0).values
            lons = ds["XLONG"].isel(Time=0).values

            bounds = [
                [float(lons.min()), float(lats.max())],
                [float(lons.max()), float(lats.max())],
                [float(lons.max()), float(lats.min())],
                [float(lons.min()), float(lats.min())],
            ]

            response["X-Domain-Bounds"] = str(bounds)

            ds.close()
            return response

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
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