import xarray as xr
import numpy as np

def extract_variable(filepath, variable, time_index=0, downsample: int = 1):
    """
    Extract a WRF variable for a given time index.
    ⚡ Supports optional downsampling to reduce memory usage.
    
    Args:
        filepath: path to wrfout NetCDF
        variable: variable name (e.g., "T2", "PRECIP")
        time_index: index along the Time dimension
        downsample: take every Nth point along lat/lon (default=1, full resolution)

    Returns:
        dict: {data, lats, lons} as lists
    """
    ds = xr.open_dataset(filepath, engine="netcdf4", chunks={})

    # 1️⃣ Validate variable
    if variable not in ds:
        ds.close()
        raise ValueError(f"{variable} not found in dataset")
    var = ds[variable]

    # 2️⃣ Handle TIME safely
    if "Time" in var.dims:
        var = var.isel(Time=time_index)

    # 3️⃣ Extract lat/lon
    if "XLAT" in ds and "XLONG" in ds:
        lats = ds["XLAT"].isel(Time=0).values
        lons = ds["XLONG"].isel(Time=0).values
    else:
        ds.close()
        raise ValueError("Missing XLAT/XLONG in WRF file")

    # 4️⃣ Downsample to reduce memory footprint
    if downsample > 1:
        var = var[::downsample, ::downsample]
        lats = lats[::downsample, ::downsample]
        lons = lons[::downsample, ::downsample]

    data = var.values.astype(np.float32)

    ds.close()
    return {
        "data": data.tolist(),
        "lats": lats.tolist(),
        "lons": lons.tolist(),
    }
