# nwp_models/tiles.py

"""
Tile rendering layer (RENDER PLANE)

Responsibilities:
- Fetch raw float32 arrays from FastAPI
- Convert arrays → 256x256 PNG XYZ tiles
- Apply colormaps and transparency
- Cache rendered tiles

This module MUST NOT:
- Read NetCDF files
- Use xarray
- Know WRF internals or projections
"""

from io import BytesIO
import requests
import numpy as np
from PIL import Image

from django.http import HttpResponse
from django.views.decorators.http import require_GET

from .services.cache import get_or_set

# -----------------------------------
# CONFIG
# -----------------------------------
TILE_SIZE = 256
FASTAPI_FIELD_URL = "http://127.0.0.1:8001/field"

# -----------------------------------
# Rendering configuration
# -----------------------------------
GLOBAL_STATS = {
    "T2": (250.0, 320.0),
    "PRECIP": (0.0, 100.0),
    "RAINNC": (0.0, 100.0),
    "RH": (0.0, 100.0),
    "U10": (-20.0, 20.0),
    "V10": (-20.0, 20.0),
}

COLORMAPS = {
    "T2": "RdYlBu_r",
    "PRECIP": "Blues",
    "RAINNC": "Blues",
    "RH": "Greens",
    "U10": "coolwarm",
    "V10": "coolwarm",
}

# -----------------------------------
# Helpers
# -----------------------------------
def parse_shape(header_value: str) -> tuple[int, int]:
    """
    Parse X-Shape header like: "300,264"
    """
    try:
        y, x = header_value.split(",")
        return int(y), int(x)
    except Exception:
        raise ValueError("Invalid X-Shape header")


def extract_tile_from_array(data: np.ndarray) -> np.ndarray:
    """
    Resize full-domain array to tile size.
    (Fast mode – geographic cropping can be added later)
    """
    from skimage.transform import resize

    return resize(
        data,
        (TILE_SIZE, TILE_SIZE),
        preserve_range=True,
        anti_aliasing=True,
    ).astype(np.float32)


def render_png(arr: np.ndarray, variable: str) -> Image.Image:
    """
    Convert numeric array → RGBA PNG
    """
    arr = np.nan_to_num(arr, nan=0.0)

    if variable in GLOBAL_STATS:
        mn, mx = GLOBAL_STATS[variable]
    else:
        mn, mx = float(arr.min()), float(arr.max())

    norm = np.clip((arr - mn) / (mx - mn + 1e-8), 0, 1)

    import matplotlib.pyplot as plt
    cmap = plt.get_cmap(COLORMAPS.get(variable, "viridis"))

    colored = cmap(norm)
    rgb = (colored[:, :, :3] * 255).astype(np.uint8)
    alpha = np.where(arr > 0, 255, 0).astype(np.uint8)

    rgba = np.dstack([rgb, alpha])
    return Image.fromarray(rgba, "RGBA")


# -----------------------------------
# Tile endpoint
# -----------------------------------
@require_GET
def tile_view(request, variable: str, z: int, x: int, y: int):
    """
    /api/wrf/tiles/<variable>/<z>/<x>/<y>.png
    """

    file = request.GET.get("file")
    time_index = int(request.GET.get("time_index", 0))

    cache_key = f"tile:{variable}:{z}:{x}:{y}:{time_index}:{file}"

    def generate():
        try:
            resp = requests.get(
                FASTAPI_FIELD_URL,
                params={
                    "datetime": file,
                    "variable": variable,
                    
                },
                timeout=30,
            )

            if resp.status_code != 200:
                return None

            # ---- reshape using metadata (NO GUESSING) ----
            shape_header = resp.headers.get("X-Shape")
            if not shape_header:
                raise ValueError("Missing X-Shape header")

            ny, nx = parse_shape(shape_header)

            data = np.frombuffer(resp.content, dtype=np.float32)
            data = data.reshape((ny, nx))

            tile_arr = extract_tile_from_array(data)
            img = render_png(tile_arr, variable)

            buf = BytesIO()
            img.save(buf, format="PNG")
            return buf.getvalue()

        except Exception as e:
            print(f"[tile_view] error: {e}")
            return None

    png = get_or_set(cache_key, generate, timeout=3600)

    if png is None:
        transparent = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), (0, 0, 0, 0))
        buf = BytesIO()
        transparent.save(buf, format="PNG")
        return HttpResponse(buf.getvalue(), content_type="image/png")

    return HttpResponse(png, content_type="image/png")