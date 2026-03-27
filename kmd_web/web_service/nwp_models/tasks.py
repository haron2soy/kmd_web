#nwp_models/tasks.py
from celery import shared_task
from .rainfall_mapper import RainfallMapper
from .temparature_mapper import TemperatureMapper
from .wind_mapper import WindMapper
from django.conf import settings
import os
from datetime import datetime, timedelta

@shared_task
def reconcile_wrf_outputs():
    raw_dir = settings.WRF_DATA_DIR
    out_base = settings.GENERATED_MAPS_DIR

    raw_files = sorted(f for f in os.listdir(raw_dir) if f.startswith("wrfout_"))

    for f in raw_files:
        run_id = f.replace("wrfout_", "")
        out_dir = os.path.join(out_base, run_id)

        # Check if output folder or rainfall map missing
        rainfall_map = os.path.join(out_dir, "hourly_rainfall.png")
        acc_map = os.path.join(out_dir, "accumulated_rainfall.png")

        if not os.path.exists(out_dir) or not (os.path.exists(rainfall_map) or os.path.exists(acc_map)):
            full_path = os.path.join(raw_dir, f)

            # Trigger processing
            process_new_wrf.delay(full_path)

def get_previous_file(nc_path):
    filename = os.path.basename(nc_path)
    
    # Extract timestamp and domain prefix
    # Example: "wrfout_d01_2026-03-26_03:00:00"
    parts = filename.split("_")
    domain = parts[1]  # "d01"
    dt_str = "_".join(parts[2:])  # "2026-03-26_03:00:00"

    dt = datetime.strptime(dt_str, "%Y-%m-%d_%H:%M:%S")
    prev_dt = dt - timedelta(hours=1)

    # Rebuild filename with domain
    prev_filename = f"wrfout_{domain}_{prev_dt.strftime('%Y-%m-%d_%H:%M:%S')}"
    prev_path = os.path.join(os.path.dirname(nc_path), prev_filename)

    return prev_path if os.path.exists(prev_path) else None
    

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=30, retry_kwargs={'max_retries': 3})
def process_new_wrf(self, nc_path):
    import xarray as xr

    ds_curr = xr.open_dataset(nc_path, engine="netcdf4")

    prev_path = get_previous_file(nc_path)
    ds_prev = xr.open_dataset(prev_path, engine="netcdf4") if prev_path else None
    next_path = get_next_file(nc_path)
    
    if next_path:
        process_new_wrf.delay(next_path)
    
    run_id = os.path.basename(nc_path).replace("wrfout_", "")
    out_dir = os.path.join(settings.GENERATED_MAPS_DIR, run_id)
    os.makedirs(out_dir, exist_ok=True)

    # Rainfall
    rain = RainfallMapper(ds_curr, ds_prev, out_dir)
    rain.load_data()
    rain.generate_map()

    # Temperature
    temp = TemperatureMapper(ds_curr, out_dir)
    temp.load_data()
    temp.generate_map()

    # Wind
    wind = WindMapper(ds_curr, out_dir)
    wind.load_data()
    wind.generate_map()

    return f"Maps generated for {run_id}"


def get_next_file(nc_path):
    filename = os.path.basename(nc_path)
    dt_str = filename.replace("wrfout_", "")
    if dt_str.startswith(("d01_", "d02_", "d03_")):
        dt_str = dt_str[4:]

    dt = datetime.strptime(dt_str, "%Y-%m-%d_%H:%M:%S")

    next_dt = dt + timedelta(hours=1)
    next_filename = f"wrfout_{next_dt.strftime('%Y-%m-%d_%H:%M:%S')}"

    next_path = os.path.join(os.path.dirname(nc_path), next_filename)
    return next_path if os.path.exists(next_path) else None