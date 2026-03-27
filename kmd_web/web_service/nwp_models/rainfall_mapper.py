#!/usr/bin/env python3
"""
----------------------------------------------------------
Spatial Rainfall Map Class (Hourly Rainfall)
- Accepts TWO consecutive WRF datasets
- Computes rainfall for that timestep (difference)
- Produces ONE rainfall map
----------------------------------------------------------
"""

import xarray as xr
import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap, BoundaryNorm
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import numpy as np
import os


class RainfallMapper:
    def __init__(self, ds_curr, ds_prev, out_dir):
        self.ds_curr = ds_curr
        self.ds_prev = ds_prev
        self.out_dir = out_dir

        self.rain = None
        self.selected_time = "WRF hourly rainfall"
        self.is_hourly = self.ds_prev is not None

    def load_data(self):
        """Compute hourly rainfall (difference between consecutive files)"""

        # Standardize variable names
        self.ds_curr = self.ds_curr.rename(
            {name: name.lower() for name in self.ds_curr.variables}
        )

        if self.ds_prev is not None:
            self.ds_prev = self.ds_prev.rename(
                {name: name.lower() for name in self.ds_prev.variables}
            )

        # Current cumulative rainfall
        rain_curr = (self.ds_curr["rainc"] + self.ds_curr["rainnc"]).isel(Time=0)

        if self.ds_prev is not None:
            rain_prev = (self.ds_prev["rainc"] + self.ds_prev["rainnc"]).isel(Time=0)

            # Hourly rainfall
            rain_slice = rain_curr - rain_prev
            self.is_hourly = True
        else:
            # First timestep fallback (not ideal scientifically)
            rain_slice = rain_curr
            self.is_hourly = False

        # Clean data
        self.rain = (
            rain_slice
            .fillna(0.0)
            .where(rain_slice >= 0.0, 0.0)  # handle restarts
        )

        # Optional: remove noise (<0.1 mm)
        self.rain = self.rain.where(self.rain >= 0.1, 0.0)

    def generate_map(self):

        fig = plt.figure(figsize=(13, 9))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # Map features
        ax.coastlines(resolution='10m', linewidth=0.7, alpha=0.9)
        ax.add_feature(cfeature.BORDERS, linewidth=0.8)
        ax.add_feature(cfeature.OCEAN, facecolor='#d8e8f5')
        ax.add_feature(cfeature.LAND, facecolor='#f5f5eb')
        ax.add_feature(cfeature.LAKES, facecolor='#a8d4ff')

        ax.gridlines(draw_labels=True, linestyle='--', alpha=0.35)

        # Coordinates
        lons = self.ds_curr["xlong"].isel(Time=0).values
        lats = self.ds_curr["xlat"].isel(Time=0).values

        ax.set_extent(
            [lons.min(), lons.max(), lats.min(), lats.max()],
            crs=ccrs.PlateCarree()
        )

        # Rainfall levels
        levels = [
            1, 5, 10, 15, 20,
            25, 30, 35, 40, 50,
            60, 70, 80, 100
        ]

        colors = [
            "#03e82a", "#00c853", "#2e7d32", "#1b5e20",
            "#bbdefb", "#64b5f6", "#2196f3", "#1976d2",
            "#0d47a1", "#fff176", "#ffc107", "#ff9800",
            "#f57c00", "#ef5350"
        ]

        cmap = ListedColormap(colors)
        norm = BoundaryNorm(levels, ncolors=len(colors), clip=True)

        # Plot
        cf = ax.contourf(
            lons, lats, self.rain.values,
            levels=levels,
            cmap=cmap,
            norm=norm,
            extend='max',
            transform=ccrs.PlateCarree()
        )

        # Colorbar
        cbar = fig.colorbar(
            cf, ax=ax,
            orientation='vertical',
            pad=0.04,
            shrink=0.7
        )

        if self.is_hourly:
            title = "hourly_rainfall_map"
            file_name = "hourly_rainfall_map"
        else:
            title = "accumulated_rainfall_map"
            file_name = "accumulated_rainfall_map"

        cbar.set_label(title)

        # Title
        ax.set_title(
            f"{title} (mm) (WRF)\n{self.selected_time}",
            fontsize=14
        )

        # Save
        os.makedirs(self.out_dir, exist_ok=True)
        #out_file = os.path.join(self.out_dir, f"{file_name}.png")
        out_file = os.path.join(
            self.out_dir,
            f"{os.path.basename(self.out_dir)}_{file_name}.png"
        )

        plt.savefig(out_file, dpi=300, bbox_inches='tight')
        plt.close(fig)

        print(f"Saved: {out_file}")


# Example usage
if __name__ == "__main__":

    f_prev = "/home/nwp/kmd_web/uploads/rsmc/2026/March/nwp_models_data/wrfout_d01_2026-03-27_15:00:00"
    f_curr = "/home/nwp/kmd_web/uploads/rsmc/2026/March/nwp_models_data/wrfout_d01_2026-03-27_16:00:00"

    ds_prev = xr.open_dataset(f_prev, engine="netcdf4")
    ds_curr = xr.open_dataset(f_curr, engine="netcdf4")

    mapper = RainfallMapper(
        ds_curr,
        ds_prev,
        out_dir="./"
    )

    mapper.load_data()
    mapper.generate_map()