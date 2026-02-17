from fastapi import FastAPI, Response, HTTPException
from netCDF4 import Dataset
from wrf import getvar
import numpy as np
import os
from functools import lru_cache

app = FastAPI()

DATA_DIR = "/home/haron/kmd/nwp_models_data/"
ALLOWED_VARIABLES = {"T2", "U10", "V10", "RAINNC"}


# -------------------------
# Build file path
# -------------------------
def build_file_path(dt_string: str):
    full_path = os.path.join(DATA_DIR, f"wrfout_d01_{dt_string}")
    print("full_path:", full_path)
    return full_path
# -------------------------
# Cache dataset (performance critical)
# -------------------------
@lru_cache(maxsize=4)
def load_dataset(file_path: str):
    if not os.path.exists(file_path):
        raise FileNotFoundError
    return Dataset(file_path)


# -------------------------
# Extract variable
# -------------------------
def extract_field(ncfile, variable: str):
    var = getvar(ncfile, variable, timeidx=0)
    return var.values.astype(np.float32)


# -------------------------
# API endpoint
# -------------------------
@app.get("/field")
def get_field(datetime: str, variable: str = "T2"):

    # Validate variable
    if variable not in ALLOWED_VARIABLES:
        raise HTTPException(status_code=400, detail="Invalid variable")

    file_path = build_file_path(datetime)

    try:
        ncfile = load_dataset(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        data = extract_field(ncfile, variable)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return Response(
        content=data.tobytes(),
        media_type="application/octet-stream",
        headers={
            "X-Shape": f"{data.shape[0]},{data.shape[1]}",  # required for frontend
            "X-Dtype": "float32",
            "X-Variable": variable
        }
    )
