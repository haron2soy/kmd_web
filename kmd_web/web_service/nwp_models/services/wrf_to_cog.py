# nwp_models/services/wrf_to_cog.py
"""
Convert WRF NetCDF → GeoTIFF → COG (Cloud Optimized GeoTIFF)
"""

from pathlib import Path
import xarray as xr
import rioxarray

OUTPUT_DIR = Path("media/cog")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def generate_cog(nc_path: str, variable: str = "precip") -> str:
    ds = xr.open_dataset(nc_path)

    if variable == "precip":
        accum = None
        for var in ["RAINNC", "RAINC"]:
            if var in ds:
                accum = ds[var] if accum is None else accum + ds[var]
        data = accum.isel(Time=-1).squeeze()

    elif variable == "t2":
        data = ds["T2"].isel(Time=-1).squeeze()

    else:
        raise ValueError(f"Unsupported variable: {variable}")

    lons = ds.XLONG.isel(Time=0)
    lats = ds.XLAT.isel(Time=0)

    da = xr.DataArray(
        data.values,
        dims=("y", "x"),
        coords={
            "x": lons.values[0, :],
            "y": lats.values[:, 0],
        },
    )

    da.rio.write_crs("EPSG:4326", inplace=True)

    tif_path = OUTPUT_DIR / f"{variable}.tif"
    cog_path = OUTPUT_DIR / f"{variable}_cog.tif"

    da.rio.to_raster(tif_path)

    # Convert to COG (requires GDAL)
    import subprocess
    subprocess.run([
        "gdal_translate",
        str(tif_path),
        str(cog_path),
        "-of", "COG",
        "-co", "COMPRESS=DEFLATE",
        "-co", "TILING_SCHEME=GoogleMapsCompatible"
    ], check=True)

    ds.close()
    return str(cog_path)
