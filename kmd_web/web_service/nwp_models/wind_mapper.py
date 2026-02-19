#nwp_models/wind_mapper.py
"""
----------------------------------------------------------
Spatial Wind Map Class (Full Grid, Single Time)
- Loads NetCDF
- Uses the only timestep
- Uses full spatial grid
- Uses USER GeoJSON as base map
- Creates ONE wind speed + direction map
----------------------------------------------------------
"""

import xarray as xr
import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib import colormaps
import cartopy.crs as ccrs
from cartopy.feature import ShapelyFeature
import geopandas as gpd
import numpy as np
import os

class WindMapper:
    def __init__(self, ds, out_dir):
        self.ds = ds
        self.out_dir = out_dir
        
        self.u = None
        self.v = None
        self.wind_speed = None
        self.selected_time = None
        self.geo_feature = None

    # ---------------------------
    # Load dataset
    # ---------------------------
    def load_data(self):
        #self.ds = xr.open_dataset(self.nc_path, engine="netcdf4")
        self.ds = self.ds.rename(
            {name: name.lower() for name in list(self.ds.data_vars) + list(self.ds.coords)}
        )

        # -----------------------------------------
        # ONE timestep → 2D
        # Prefer 10 m winds if available
        # -----------------------------------------
        if "u10" in self.ds and "v10" in self.ds:
            self.u = self.ds["u10"].isel(Time=0)
            self.v = self.ds["v10"].isel(Time=0)
        else:
            # fallback: lowest model level
            self.u = self.ds["u"].isel(Time=0, bottom_top=0)
            self.v = self.ds["v"].isel(Time=0, bottom_top=0)

        # --- Wind speed magnitude (m/s) ---
        self.wind_speed = np.sqrt(self.u**2 + self.v**2)

        self.selected_time = "WRF single timestep"

    # ---------------------------
    # Create map (FULL GRID)
    # ---------------------------
    def generate_map(self):
        # Check if data exists
        if self.wind_speed is None or np.all(np.isnan(self.wind_speed)):
            print(f"[WindMapper] No valid Wind data at timestep. Skipping map.")
            return
        fig = plt.figure(figsize=(12, 8))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # -----------------------------------------
        # Full grid extent
        # -----------------------------------------
        lats = self.ds["xlat"].isel(Time=0)
        lons = self.ds["xlong"].isel(Time=0)

        ax.set_extent(
            [
                float(lons.min()),
                float(lons.max()),
                float(lats.min()),
                float(lats.max())
            ],
            crs=ccrs.PlateCarree()
        )


        # -----------------------------------------
        # Wind speed shading
        # -----------------------------------------
        #wmin = float(self.wind_speed.min())
        #wmax = float(self.wind_speed.max())
        wmin = float(self.wind_speed.min(skipna=True))
        wmax = float(self.wind_speed.max(skipna=True))
        # -----------------------------------------
        # Validate contour levels
        # -----------------------------------------
        if (
            not np.isfinite(wmin)
            or not np.isfinite(wmax)
            or wmin >= wmax
        ):
            print(
                f"[WindMapper] Invalid wind range (wmin={wmin}, wmax={wmax}) — skipping map."
            )
            return

        N_COLORS = 30
        #levels = np.linspace(wmin, wmax, N_COLORS + 1)

        #cmap = colormaps["turbo"].resampled(N_COLORS)
        # -----------------------------------------
        # Wind speed levels (fixed, operational)
        # -----------------------------------------
        
        levels = np.array(
            [0, 1, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50]
        )

        cmap = colormaps["turbo"].resampled(len(levels) - 1)


        cf = ax.contourf(
            lons.values,
            lats.values,
            self.wind_speed,
            levels=levels,
            cmap=cmap,
            extend="max",
            transform=ccrs.PlateCarree(),
            zorder=1
        )

        plt.colorbar(
            cf,
            shrink=0.7,
            pad=0.05,
            label="Wind Speed (m s⁻¹)"
        )

        # -----------------------------------------
        # Wind vectors (THINNED)
        # -----------------------------------------
        skip = 10  # vector density control

        ax.quiver(
            lons.values[::skip, ::skip],
            lats.values[::skip, ::skip],
            self.u.values[::skip, ::skip],
            self.v.values[::skip, ::skip],
            transform=ccrs.PlateCarree(),
            scale=700,
            width=0.0025,
            color="black",
            zorder=3
        )

        # -----------------------------------------
        # Gridlines only
        # -----------------------------------------
        ax.gridlines(draw_labels=True, linestyle="--", alpha=0.5)

        # -----------------------------------------
        # Title & output
        # -----------------------------------------
        ax.set_title(
            f"10 m Wind Speed & Direction – Full Domain\n{self.selected_time}",
            fontsize=14,
            pad=20
        )

        #out_file = "WRF_single_timestep_full_domain_wind_map.png"
        out_file = os.path.join(
            self.out_dir,
            f"{os.path.basename(self.out_dir)}_wind_map.png"
        )
        self.add_north_arrow(ax)
        plt.tight_layout()
        plt.savefig(out_file, dpi=300, bbox_inches="tight")
        plt.close()

        print(f"Saved: {out_file}")

    # ---------------------------
    # North arrow
    # ---------------------------
    def add_north_arrow(self, ax, position=(0.95, 0.15), size=14):
        ax.annotate(
            "N",
            xy=(position[0], position[1] + 0.1),
            xycoords="axes fraction",
            ha="center",
            va="center",
            fontsize=size,
            fontweight="bold",
            zorder=10
        )

        ax.annotate(
            "",
            xy=(position[0], position[1] + 0.05),
            xytext=(position[0], position[1]),
            xycoords="axes fraction",
            arrowprops=dict(facecolor="black", width=3, headwidth=10),
            zorder=10
        )


# ----------------------------------------------------------
# __main__
# ----------------------------------------------------------
'''if __name__ == "__main__":

    mapper = WindMapper(
        nc_path="/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-11_13:00:00",
        
    )

    mapper.load_data()

    mapper.generate_map()'''
