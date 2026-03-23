#nwp_models/tasks.py
from celery import shared_task
from .rainfall_mapper import RainfallMapper
from .temparature_mapper import TemperatureMapper
from .wind_mapper import WindMapper
import os

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=30, retry_kwargs={'max_retries': 3})
def process_new_wrf(self, nc_path):
    import xarray as xr

    ds = xr.open_dataset(nc_path, engine="netcdf4")

    run_id = os.path.basename(nc_path).replace("wrfout_", "")
    out_dir = f"/home/haron/kmd/generated_maps/{run_id}"
    os.makedirs(out_dir, exist_ok=True)

    # Rainfall
    rain = RainfallMapper(ds, out_dir)
    rain.load_data()
    rain.generate_map()

    # Temperature
    temp = TemperatureMapper(ds, out_dir)
    temp.load_data()
    temp.generate_map()

    # Wind
    wind = WindMapper(ds, out_dir)
    wind.load_data()
    wind.generate_map()

    return f"Maps generated for {run_id}"
