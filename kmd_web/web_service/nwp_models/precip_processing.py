# nwp_models/precip_processing.py
'''
import xarray as xr
import numpy as np
import rioxarray
from pathlib import Path

def wrf_to_geotiff(nc_file: str, output_path: str):
    ds = xr.open_dataset(nc_file)

    # Combine precipitation
    accum = None
    for var in ['RAINNC', 'RAINC']:
        if var in ds:
            accum = ds[var] if accum is None else accum + ds[var]

    precip = accum.isel(Time=-1).squeeze()

    # Coordinates
    lons = ds.XLONG.isel(Time=0)
    lats = ds.XLAT.isel(Time=0)

    # Convert to DataArray with coords
    da = xr.DataArray(
        precip.values,
        dims=("y", "x"),
        coords={
            "x": lons.values[0, :],
            "y": lats.values[:, 0],
        },
    )

    # Assign CRS
    da.rio.write_crs("EPSG:4326", inplace=True)

    # Export GeoTIFF
    da.rio.to_raster(output_path)

    ds.close()

    return output_path
'''