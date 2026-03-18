"""
----------------------------------------------------------
Spatial Rainfall Map Class (Full Grid, Single Time)
- Receives already opened xarray Dataset
- Uses the only timestep
- Creates ONE rainfall map with proper color progression
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
    def __init__(self, ds, out_dir):
        self.ds = ds
        self.out_dir = out_dir
        
        self.rain = None
        self.selected_time = "WRF single timestep"

    def load_data(self):
        """Prepare 2D total accumulated rainfall array"""
        # Standardize variable/coord names to lowercase
        self.ds = self.ds.rename(
            {name: name.lower() for name in list(self.ds.variables)}
        )

        # Combine convective + large-scale rain and select first timestep
        rain_slice = (self.ds["rainc"] + self.ds["rainnc"]).isel(Time=0)

        # Replace NaN with 0 and keep only >= 0
        self.rain = rain_slice.fillna(0.0).where(rain_slice >= 0.0, 0.0)

    def generate_map(self):
        '''if self.rain is None or np.all(self.rain == 0):
            print("[RainfallMapper] No valid rainfall data. Skipping map.")
            return'''

        fig = plt.figure(figsize=(13, 9))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # Coordinate arrays (2D)
        lons = self.ds["xlong"].isel(Time=0).values
        lats = self.ds["xlat"].isel(Time=0).values

        min_lon, max_lon = lons.min(), lons.max()
        min_lat, max_lat = lats.min(), lats.max()

        ax.set_extent([min_lon, max_lon, min_lat, max_lat], crs=ccrs.PlateCarree())

        # ────────────────────────────────────────────────
        # Rainfall levels and colors – 17 bins / 17 colors
        # ────────────────────────────────────────────────
        levels = [
            1.0,   5.0,  10.0,  15.0,  20.0,
            25.0,  30.0,  35.0,  40.0,  50.0,
            60.0,  70.0,  80.0,  100.0
        ]

        colors = [
            #"#ffffff",    # 0–1 mm       – white / trace
            "#03e82a",    # 1–5 mm       – bright vivid green (new minimum)
            "#00c853",    # 5–10 mm      – medium green
            "#2e7d32",    # 10–15 mm     – darker green
            "#1b5e20",    # 15–20 mm     – deep green transition
            "#bbdefb",    # 20–25 mm     – soft blue
            "#64b5f6",    # 25–30 mm     – light strong blue
            "#2196f3",    # 30–35 mm     – strong blue
            "#1976d2",    # 35–40 mm     – deep blue
            "#0d47a1",    # 40–50 mm     – very deep blue (replacing previous yellow comment)
            "#fff176",    # 50–60 mm     – yellow
            "#ffc107",    # 60–70 mm     – yellow-orange
            "#ff9800",    # 70–80 mm     – orange
            "#f57c00",    # 80–100 mm    – red-orange
            "#ef5350",    # >100 mm      – dark red
        ]

        cmap = ListedColormap(colors)
        norm = BoundaryNorm(levels, ncolors=len(colors), clip=True)

        # Main contour fill
        cf = ax.contourf(
            lons, lats, self.rain.values,
            levels=levels,
            cmap=cmap,
            norm=norm,
            extend='max',
            transform=ccrs.PlateCarree(),
            antialiased=True,
            rasterized=True
        )

        # Colorbar with nice labels
        cbar = fig.colorbar(
            cf, ax=ax,
            shrink=0.68,
            pad=0.04,
            orientation='horizontal',
            extend='max',
            ticks=levels[:-1] + [105]   # nicer placement for 100+
        )

        cbar_labels = [
            "1", "5", "10", "15",
            "20", "25", "30", "35", "40",
            "50", "60", "70", "80", "100+"
        ]
        cbar.set_ticklabels(cbar_labels)
        cbar.set_label("Accumulated Rainfall (mm)", fontsize=11)
        cbar.ax.tick_params(labelsize=10)

        # ────────────────────────────────────────────────
        # Map decoration
        # ────────────────────────────────────────────────
        ax.coastlines(resolution='10m', linewidth=0.7, alpha=0.9)
        ax.add_feature(cfeature.BORDERS, linestyle='-', linewidth=0.8, alpha=0.7)
        ax.add_feature(cfeature.OCEAN, facecolor='#d8e8f5', zorder=0)
        ax.add_feature(cfeature.LAND, facecolor='#f5f5eb', zorder=0)
        ax.add_feature(cfeature.LAKES, facecolor='#a8d4ff', edgecolor='black', linewidth=0.4)

        # Country borders (helpful especially in East Africa context)
        ax.add_feature(cfeature.NaturalEarthFeature(
            'cultural', 'admin_0_countries', '10m',
            edgecolor='black', facecolor='none', linewidth=0.9
        ))

        ax.gridlines(draw_labels=True, linestyle='--', alpha=0.35)

        # Title
        ax.set_title(
            f"Accumulated Rainfall – E. Africa Domain\n{self.selected_time}",
            fontsize=14, pad=18
        )

        # North arrow
        self.add_north_arrow(ax)

        # Save
        os.makedirs(self.out_dir, exist_ok=True)
        out_file = os.path.join(
            self.out_dir,
            f"{os.path.basename(self.out_dir)}_rainfall_map.png"
        )

        plt.tight_layout()
        plt.savefig(out_file, dpi=300, bbox_inches='tight')
        plt.close(fig)
        print(f"Saved: {out_file}")

    def add_north_arrow(self, ax, position=(0.95, 0.14), size=15):
        ax.annotate(
            'N',
            xy=(position[0], position[1] + 0.09),
            xycoords='axes fraction',
            ha='center', va='center',
            fontsize=size, fontweight='bold'
        )
        ax.annotate(
            '',
            xy=(position[0], position[1] + 0.04),
            xytext=(position[0], position[1]),
            xycoords='axes fraction',
            arrowprops=dict(facecolor='black', width=3.2, headwidth=11)
        )


# Example usage (uncomment when needed)
if __name__ == "__main__":
     ds = xr.open_dataset("/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-25_15:00:00", engine="netcdf4")
     mapper = RainfallMapper(ds, out_dir="/home/haron/kmd/generated_maps/20260225_1400")
     mapper.load_data()
     mapper.generate_map()