"""
----------------------------------------------------------
Spatial Rainfall Map Class (Full Grid, Single Time)
- Loads NetCDF
- Uses the only timestep
- Uses full spatial grid
- Creates ONE rainfall map
----------------------------------------------------------
"""

import xarray as xr
import matplotlib
matplotlib.use('Agg')

from matplotlib.colors import LinearSegmentedColormap

import matplotlib.pyplot as plt
from matplotlib import colormaps
import cartopy.crs as ccrs
import cartopy.feature as cfeature
from datetime import datetime
import numpy as np


class CountyRainfallMapper:
    def __init__(self, nc_path):
        self.nc_path = nc_path
        self.ds = None
        self.rain = None
        self.selected_time = None

    # ---------------------------
    # Load dataset
    # ---------------------------
    def load_data(self):
        self.ds = xr.open_dataset(self.nc_path, engine='netcdf4')
        self.ds = self.ds.rename(
            {name: name.lower() for name in list(self.ds.data_vars) + list(self.ds.coords)}
        )

        # --- Dataset has ONE timestep → force 2D ---
        rain_slice = (self.ds["rainc"] + self.ds["rainnc"]).isel(Time=0)
        

        # --- Total accumulated rainfall (mm) ---
        self.rain = rain_slice.where(rain_slice >0.0)

    # ---------------------------
    # Create map (FULL GRID)
    # ---------------------------
    def generate_map(self):
        fig = plt.figure(figsize=(12, 8))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # -----------------------------------------
        # Full grid extent from NetCDF
        # -----------------------------------------
        lats = self.ds["xlat"].isel(Time=0)
        lons = self.ds["xlong"].isel(Time=0)

        self.selected_time = "WRF single timestep"

        minx, maxx = lons.min(), lons.max()
        miny, maxy = lats.min(), lats.max()

        ax.set_extent([minx, maxx, miny, maxy], crs=ccrs.PlateCarree())

        # -----------------------------------------
        # Rainfall Contours (UNCHANGED STRUCTURE)
        # -----------------------------------------
        rmin = float(self.rain.min())
        rmax = float(self.rain.max())

        N_COLORS = 30
        fixed_levels = np.linspace(rmin, rmax, N_COLORS + 1)

        '''base_cmap = colormaps["turbo"]
        discrete_cmap = base_cmap.resampled(N_COLORS)'''
        # -----------------------------------------
        # Custom rainfall colormap
        # light green → dark green → yellow → orange → red
        # -----------------------------------------
        rain_colors = [
            "#e5f5e0",  # very light green (lowest rainfall)
            "#a1d99b",  # light green
            "#31a354",  # dark green
            "#ffff33",  # yellow
            "#fdae61",  # orange
            "#d7191c"   # red (highest rainfall)
        ]
        base_cmap = LinearSegmentedColormap.from_list(
        "custom_rainfall",
        rain_colors,
        N_COLORS
        )

        discrete_cmap = base_cmap

        levels = plt.contourf(
            lons.values,
            lats.values,
            self.rain,
            levels=fixed_levels,
            cmap=discrete_cmap,
            extend="max",
            transform=ccrs.PlateCarree()
        )

        # Optional visual smoothing (PRESERVED)
        if lats.values.size <= 5:
            fine_lat = np.linspace(
                lons.values.min().item(),
                lats.values.max().item(),
                200
            )
            subset_smooth = self.rain.interp(latitude=fine_lat, method='linear')

            subset_smooth.plot.contourf(
                ax=ax,
                levels=fixed_levels,
                cmap=discrete_cmap,
                extend='max',
                add_colorbar=False,
                transform=ccrs.PlateCarree(),
                alpha=0.9
            )

        plt.colorbar(
            levels,
            shrink=0.7,
            pad=0.05,
            label='Accumulated Rainfall (mm)'
        )

        # -----------------------------------------
        # Base layers (UNCHANGED)
        # -----------------------------------------
        ax.coastlines(resolution='10m', linewidth=0.8)
        ax.add_feature(cfeature.BORDERS, linestyle='-', linewidth=1.0, alpha=0.7)
        ax.add_feature(cfeature.OCEAN)
        ax.add_feature(cfeature.LAND)
        ax.add_feature(cfeature.LAKES, edgecolor='black', facecolor='lightblue')
        ax.gridlines(draw_labels=True, alpha=0.5, linestyle='--')

        # -----------------------------------------
        # Title & output
        # -----------------------------------------
        time_str = self.selected_time.replace(":", "-")
        ax.set_title(
            f"Accumulated Rainfall – Full Domain\n{self.selected_time}",
            fontsize=14,
            pad=20
        )

        out_file = f"{time_str}_full_domain_rainfall_map.png"

        self.add_north_arrow(ax)
        plt.tight_layout()
        plt.savefig(out_file, dpi=300, bbox_inches='tight')
        plt.close()

        print(f"Saved: {out_file}")

    # ---------------------------
    # North arrow (UNCHANGED)
    # ---------------------------
    def add_north_arrow(self, ax, position=(0.95, 0.15), size=14):
        ax.annotate(
            'N',
            xy=(position[0], position[1] + 0.1),
            xycoords='axes fraction',
            ha='center',
            va='center',
            fontsize=size,
            fontweight='bold'
        )

        ax.annotate(
            '',
            xy=(position[0], position[1] + 0.05),
            xytext=(position[0], position[1]),
            xycoords='axes fraction',
            arrowprops=dict(facecolor='black', width=3, headwidth=10)
        )


# ----------------------------------------------------------
# __main__
# ----------------------------------------------------------
if __name__ == "__main__":

    mapper = CountyRainfallMapper(
        nc_path="/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-11_13:00:00"
    )

    mapper.load_data()
    mapper.generate_map()