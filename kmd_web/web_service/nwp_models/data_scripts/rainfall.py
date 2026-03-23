"""
----------------------------------------------------------
Spatial Rainfall Map Class (Full Grid, Single Time)
- Loads NetCDF from WRF
- Uses the only timestep (or squeezes singleton dims)
- Creates ONE rainfall map with clear color progression
----------------------------------------------------------
"""

import xarray as xr
import matplotlib
matplotlib.use('Agg')  # non-interactive backend

import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap, BoundaryNorm
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import numpy as np


class CountyRainfallMapper:
    def __init__(self, nc_path):
        self.nc_path = nc_path
        self.ds = None
        self.rain_2d = None
        self.lats_2d = None
        self.lons_2d = None
        self.selected_time = "WRF single timestep"

    def load_data(self):
        """Load NetCDF and prepare 2D total rainfall array"""
        self.ds = xr.open_dataset(self.nc_path, engine='netcdf4')

        # Standardize variable/coord names to lowercase
        rename_dict = {name: name.lower() for name in self.ds.variables}
        self.ds = self.ds.rename(rename_dict)

        # Combine convective + non-convective rainfall
        rain_var = self.ds["rainc"] + self.ds["rainnc"]

        # Select first timestep if exists
        if "time" in rain_var.dims:
            rain_total = rain_var.isel(time=0)
        else:
            rain_total = rain_var

        # Keep values >= 0 and squeeze singleton dims
        self.rain_2d = rain_total.where(rain_total >= 0.0, 0.0).squeeze()

        # Coordinates
        if "time" in self.ds["xlat"].dims:
            self.lats_2d = self.ds["xlat"].isel(time=0).squeeze().values
            self.lons_2d = self.ds["xlong"].isel(time=0).squeeze().values
        else:
            self.lats_2d = self.ds["xlat"].squeeze().values
            self.lons_2d = self.ds["xlong"].squeeze().values

    def generate_map(self, output_prefix="rainfall"):
        """Create and save the rainfall map"""
        fig = plt.figure(figsize=(13, 9))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # Domain extent
        min_lon, max_lon = self.lons_2d.min(), self.lons_2d.max()
        min_lat, max_lat = self.lats_2d.min(), self.lats_2d.max()
        ax.set_extent([min_lon, max_lon, min_lat, max_lat], crs=ccrs.PlateCarree())

        # ────────────────────────────────────────────────
        # Rainfall color levels and colors (17 bins → 17 colors)
        # ────────────────────────────────────────────────
        levels = [
            1.0, 5.0, 10.0, 15.0, 20.0,
            25.0, 30.0, 35.0, 40.0, 50.0,
            60.0, 70.0, 80.0, 90.0, 100.0, 200.0
        ]

        colors = [
            "#81c784", "#4caf50","#1cea4e", "#03d134", "#02ba2e", "#028b23",   # 1–20 (greens)
            "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#1e88e5",    # 20–50 (blues)
            "#fff176", "#ffee58", "#ffca28", "#ffa726", "#ff7043",    # 50–100 (yellow→orange→red)
            "#d32f2f"                                                  # >100
        ]

        cmap = ListedColormap(colors)
        norm = BoundaryNorm(levels, ncolors=len(colors), clip=True)

        # Plot filled contours
        cf = ax.contourf(
            self.lons_2d,
            self.lats_2d,
            self.rain_2d,
            levels=levels,
            cmap=cmap,
            norm=norm,
            extend='max',
            transform=ccrs.PlateCarree(),
            antialiased=True,
            rasterized=True
        )

        # Colorbar
        cbar = fig.colorbar(
            cf, ax=ax,
            shrink=0.68,
            pad=0.04,
            orientation='vertical',
            extend='max',
            ticks=levels[:-1] + [105]  # last label nicely
        )

        # Human-readable labels
        cbar_labels = [
            "1", "5", "10", "15",
            "20", "25", "30", "35", "40", "50",
            "60", "70", "80", "90", "100", "100+"
        ]
        cbar.set_ticklabels(cbar_labels)
        cbar.set_label("Accumulated Rainfall (mm)", fontsize=11)
        cbar.ax.tick_params(labelsize=10)

        # ────────────────────────────────────────────────
        # Map features
        # ────────────────────────────────────────────────
        ax.coastlines(resolution='10m', linewidth=0.7, alpha=0.9)
        ax.add_feature(cfeature.BORDERS, linestyle='-', linewidth=0.8, alpha=0.7)
        ax.add_feature(cfeature.OCEAN, facecolor='#d0e4f5', zorder=0)
        ax.add_feature(cfeature.LAND, facecolor='#f0f0e8', zorder=0)
        ax.add_feature(cfeature.LAKES, facecolor='#a6d5ff', edgecolor='black', linewidth=0.4)

        # Countries more prominently
        countries = cfeature.NaturalEarthFeature(
            category='cultural',
            name='admin_0_countries',
            scale='10m',
            facecolor='none',
            edgecolor='black',
            linewidth=0.9
        )
        ax.add_feature(countries)

        ax.gridlines(draw_labels=True, linestyle='--', alpha=0.4)

        # Title
        ax.set_title(
            f"Accumulated Rainfall – Full Domain\n{self.selected_time}",
            fontsize=14, pad=18
        )

        # North arrow
        self._add_north_arrow(ax)

        # Save
        plt.tight_layout()
        outfile = f"{output_prefix}_full_domain_rainfall.png"
        plt.savefig(outfile, dpi=300, bbox_inches='tight')
        plt.close(fig)
        print(f"Saved: {outfile}")

    def _add_north_arrow(self, ax, x=0.95, y=0.14, size=16):
        ax.annotate('N', xy=(x, y+0.09), xycoords='axes fraction',
                    ha='center', va='center', fontsize=size, fontweight='bold')
        ax.annotate('', xy=(x, y+0.04), xytext=(x, y),
                    xycoords='axes fraction',
                    arrowprops=dict(facecolor='black', width=3.2, headwidth=11))


# ----------------------------------------------------------
# Usage
# ----------------------------------------------------------
if __name__ == "__main__":
    mapper = CountyRainfallMapper(
        nc_path="/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-25_14:00:00"
    )

    mapper.load_data()
    mapper.generate_map(output_prefix="20260225_1400")