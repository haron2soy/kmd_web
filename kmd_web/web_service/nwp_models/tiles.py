# nwp-models/tiles.py

"""
Generates 256x256 PNG XYZ tiles from WRF NetFILES.
Properly handles geographic coordinates and includes base map.
"""

import os
from io import BytesIO
from functools import lru_cache
import requests
import xarray as xr
import numpy as np
import pyproj
from PIL import Image
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache

from .services.cache import build_cache_key, get_or_set

TILE_SIZE = 256
WRF_DATA_DIR = "/home/haron/kmd/nwp_models_data/"

# WRF projection parameters (adjust based on your domain)
WRF_PROJ = {
    'proj': 'lcc',  # Lambert Conformal Conic (common for WRF)
    'lat_1': 30.,   # Standard parallels
    'lat_2': 60.,
    'lat_0': 0.,    # Center latitude
    'lon_0': 37.,   # Center longitude (Kenya)
    'x_0': 0,
    'y_0': 0,
    'datum': 'WGS84',
    'units': 'm'
}

# Global min/max for consistent coloring
GLOBAL_STATS = {
    "T2": (250.0, 320.0),      # Temperature in Kelvin
    "RAINNC": (0, 100),         # Rainfall in mm
    "RAINC": (0, 100),
    "PRECIP": (0, 100),         # Combined precipitation
    "RH": (0, 100),             # Relative humidity
    "U10": (-20, 20),           # Wind components
    "V10": (-20, 20),
}

# Colormap configuration per variable
COLORMAPS = {
    "T2": "RdYlBu_r",           # Temperature (red=hot, blue=cold)
    "RAINNC": "Blues",           # Precipitation (blue intensity)
    "PRECIP": "Blues",
    "RH": "Greens",              # Humidity
}


# -------------------------------
# Dataset handling with caching
# -------------------------------
@lru_cache(maxsize=4)
def get_dataset(file_name: str):
    """Open dataset with optimized chunking"""
    full_path = os.path.join(WRF_DATA_DIR, file_name)
    
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"WRF file not found: {full_path}")
    
    # Open with chunking for better performance
    ds = xr.open_dataset(
        full_path, 
        engine="netcdf4", 
        chunks={"Time": 1, "south_north": 256, "west_east": 256}
    )
    
    # Pre-compute combined precipitation if needed
    if "RAINNC" in ds and "RAINC" in ds and "PRECIP" not in ds:
        ds = ds.assign(PRECIP=ds.RAINNC + ds.RAINC)
    
    return ds


# -------------------------------
# Geographic coordinate conversion
# -------------------------------
def setup_transformers(ds):
    """
    Set up coordinate transformers between WRF grid and lat/lon
    """
    # Get WRF grid coordinates
    lats = ds.XLAT.isel(Time=0).values
    lons = ds.XLONG.isel(Time=0).values
    
    # Create transformer from lat/lon to WRF grid indices
    # This is approximate - for precise mapping we'd use the projection
    def latlon_to_indices(lat, lon):
        """Find nearest grid cell indices for given lat/lon"""
        # Calculate distances
        dist = (lats - lat)**2 + (lons - lon)**2
        y, x = np.unravel_index(np.argmin(dist), dist.shape)
        return y, x
    
    return latlon_to_indices


# -------------------------------
# Tile extraction with geographic bounds
# -------------------------------
def extract_tile_geographic(ds, variable: str, time_index: int, 
                            z: int, x: int, y: int):
    """
    Extract tile based on geographic bounds (Web Mercator)
    """
    if variable not in ds:
        raise ValueError(f"Variable '{variable}' not found in dataset")
    
    # Get tile bounds in Web Mercator (EPSG:3857)
    from mercantile import xy_bounds
    bounds = xy_bounds(x, y, z)
    west, south, east, north = bounds
    
    # Convert to lat/lon (EPSG:4326)
    transformer = pyproj.Transformer.from_crs("EPSG:3857", "EPSG:4326", always_xy=True)
    west_lon, south_lat = transformer.transform(west, south)
    east_lon, north_lat = transformer.transform(east, north)
    
    # Get data for time index
    max_time = ds.sizes.get("Time", 1)
    time_index = min(time_index, max_time - 1)
    data = ds[variable].isel(Time=time_index)
    
    # Get coordinate arrays
    lats = ds.XLAT.isel(Time=0)
    lons = ds.XLONG.isel(Time=0)
    
    # Find indices within bounds
    lat_mask = (lats >= south_lat) & (lats <= north_lat)
    lon_mask = (lons >= west_lon) & (lons <= east_lon)
    mask = lat_mask & lon_mask
    
    if not mask.any():
        # Return empty tile if no data in bounds
        return np.zeros((TILE_SIZE, TILE_SIZE), dtype=np.float32)
    
    # Get indices of valid data
    y_indices, x_indices = np.where(mask)
    y_min, y_max = y_indices.min(), y_indices.max()
    x_min, x_max = x_indices.min(), x_indices.max()
    
    # Extract data subset
    arr = data.values[y_min:y_max+1, x_min:x_max+1]
    
    # Resize to tile size
    from skimage.transform import resize
    arr = resize(
        arr,
        (TILE_SIZE, TILE_SIZE),
        preserve_range=True,
        anti_aliasing=True,
        mode='constant'
    )
    
    return arr.astype(np.float32)


# -------------------------------
# Enhanced rendering with proper colormaps
# -------------------------------
def to_png_with_colormap(arr: np.ndarray, variable: str) -> Image.Image:
    """
    Convert array to PNG with appropriate colormap and legend info
    """
    # Handle missing values
    arr = np.nan_to_num(arr, nan=0.0)
    
    # Normalize
    if variable in GLOBAL_STATS:
        mn, mx = GLOBAL_STATS[variable]
    else:
        mn, mx = arr.min(), arr.max()
    
    norm = (arr - mn) / (mx - mn + 1e-8)
    norm = np.clip(norm, 0, 1)
    
    # Apply colormap
    try:
        import matplotlib.pyplot as plt
        from matplotlib.colors import Normalize
        
        cmap_name = COLORMAPS.get(variable, "viridis")
        cmap = plt.get_cmap(cmap_name)
        
        # Apply colormap
        colored = cmap(norm)
        
        # Convert to 8-bit RGB
        rgb = (colored[:, :, :3] * 255).astype(np.uint8)
        
        # Add alpha channel for transparency where data is missing
        alpha = np.where(arr > 0, 255, 0).astype(np.uint8)
        
        # Create RGBA image
        rgba = np.dstack([rgb, alpha])
        
        return Image.fromarray(rgba, 'RGBA')
        
    except ImportError:
        # Fallback to grayscale with alpha
        img = (norm * 255).astype(np.uint8)
        alpha = np.where(arr > 0, 255, 0).astype(np.uint8)
        rgba = np.stack([img, img, img, alpha], axis=-1)
        return Image.fromarray(rgba, 'RGBA')


# -------------------------------
# API endpoints
# -------------------------------
def tile_view(request, variable: str, z: int, x: int, y: int, model: str = "default"):
    file = request.GET.get("file")
    time_index = int(request.GET.get("time_index", 0))

    cache_key = f"tile:{model}:{variable}:{z}:{x}:{y}:{time_index}:{file}"

    def generate():
        try:
            # 🔥 CALL FASTAPI INSTEAD OF LOADING DATA LOCALLY
            response = requests.get(
                "http://localhost:8001/field",
                params={
                    "file": file,
                    "variable": variable,
                    "time_index": time_index
                },
                timeout=30
            )

            if response.status_code != 200:
                return None

            # Convert bytes → numpy
            data = np.frombuffer(response.content, dtype=np.float32)

            # 🔧 reshape (IMPORTANT: must match your domain)
            data = data.reshape((300, 264))  # <-- your domain

            # Continue with existing pipeline
            arr = extract_tile_geographic_from_array(data, z, x, y)
            img = to_png_with_colormap(arr, variable)

            buf = BytesIO()
            img.save(buf, format="PNG")
            return buf.getvalue()

        except Exception as e:
            print(f"Tile error: {e}")
            return None

    png_bytes = get_or_set(cache_key, generate, timeout=3600)

    if png_bytes is None:
        transparent = Image.new('RGBA', (TILE_SIZE, TILE_SIZE), (0, 0, 0, 0))
        buf = BytesIO()
        transparent.save(buf, format="PNG")
        return HttpResponse(buf.getvalue(), content_type="image/png")

    return HttpResponse(png_bytes, content_type="image/png")



def metadata_view(request):
    """Return metadata about available WRF data"""
    file = request.GET.get("file")
    
    try:
        ds = get_dataset(file)
        
        # Get time information
        times = ds.XTIME.values if "XTIME" in ds else []
        times_str = [str(t) for t in times]
        
        # Get available variables
        variables = []
        for var in ["T2", "RAINNC", "RAINC", "PRECIP", "RH", "U10", "V10"]:
            if var in ds:
                variables.append({
                    "name": var,
                    "units": ds[var].attrs.get("units", ""),
                    "description": ds[var].attrs.get("description", var),
                    "min": float(ds[var].min().values),
                    "max": float(ds[var].max().values),
                })
        
        return JsonResponse({
            "times": times_str,
            "variables": variables,
            "domain": {
                "lat_min": float(ds.XLAT.min()),
                "lat_max": float(ds.XLAT.max()),
                "lon_min": float(ds.XLONG.min()),
                "lon_max": float(ds.XLONG.max()),
            }
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

def extract_tile_geographic_from_array(data, z, x, y):
    """
    Same logic as before but using raw numpy array
    (skip lat/lon masking for now — fast mode)
    """

    from skimage.transform import resize

    return resize(
        data,
        (TILE_SIZE, TILE_SIZE),
        preserve_range=True,
        anti_aliasing=True
    ).astype(np.float32)
