import xarray as xr
import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap, BoundaryNorm
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import numpy as np
import os


class WindMapper:
    def __init__(self, ds, out_dir):
        self.ds = ds
        self.out_dir = out_dir
        
        self.u = None
        self.v = None
        self.wind_speed = None
        self.selected_time = "WRF single timestep"

    def load_data(self):
        # Normalize names
        self.ds = self.ds.rename(
            {name: name.lower() for name in list(self.ds.variables)}
        )

        # Wind components
        if "u10" in self.ds and "v10" in self.ds:
            self.u = self.ds["u10"].isel(Time=0)
            self.v = self.ds["v10"].isel(Time=0)
        else:
            self.u = self.ds["u"].isel(Time=0, bottom_top=0)
            self.v = self.ds["v"].isel(Time=0, bottom_top=0)

        self.wind_speed = np.sqrt(self.u**2 + self.v**2)

    def generate_map(self):
        if self.wind_speed is None or np.all(np.isnan(self.wind_speed)):
            print("[WindMapper] No valid wind data.")
            return

        fig = plt.figure(figsize=(13, 9))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # Coordinates
        lons = self.ds["xlong"].isel(Time=0).values
        lats = self.ds["xlat"].isel(Time=0).values

        ax.set_extent(
            [lons.min(), lons.max(), lats.min(), lats.max()],
            crs=ccrs.PlateCarree()
        )

        # ─────────────────────────────
        # FIX 1: REMOVE WHITE DOT GRID
        # ─────────────────────────────
        levels = [0, 1, 3, 5, 7, 10, 14, 21, 29, 40, 50]

        colors = [
            "#8a2be2", "#4169e1", "#1e90ff", "#4ab2ff",
            "#03e82a", "#1c862d", "#f4dd1d",
            "#debc1a", "#ff00ff", "#ff1493", "#ff0000"
        ]

        cmap = ListedColormap(colors)
        norm = BoundaryNorm(levels, len(colors))

        # KEY FIX: no antialias, no rasterized
        cf = ax.contourf(
            lons, lats, self.wind_speed.values,
            levels=levels,
            cmap=cmap,
            norm=norm,
            extend='max',
            transform=ccrs.PlateCarree()
        )

        # Colorbar
        cbar = fig.colorbar(cf, ax=ax, shrink=0.7, pad=0.04)
        cbar.set_label("Wind Speed (m s⁻¹)")

        # ─────────────────────────────
        # FIX 2: PROPER WIND ARROWS
        # ─────────────────────────────
        skip = max(1, int(lons.shape[0] / 35))  # dynamic density

        ax.quiver(
            lons[::skip, ::skip],
            lats[::skip, ::skip],
            self.u.values[::skip, ::skip],
            self.v.values[::skip, ::skip],

            # CRITICAL SETTINGS
            color='black',
            scale=None,                # auto scale → length reflects magnitude
            scale_units='xy',          # use data coordinates
            angles='xy',               # true direction
            width=0.0028,
            headwidth=4,
            headlength=5,

            transform=ccrs.PlateCarree(),
            zorder=3
        )

        # ─────────────────────────────
        # MAP FEATURES (like rainfall)
        # ─────────────────────────────
        ax.coastlines(resolution='10m', linewidth=0.7)
        ax.add_feature(cfeature.BORDERS, linewidth=0.8)
        ax.add_feature(cfeature.OCEAN, facecolor='#d8e8f5', zorder=0)
        ax.add_feature(cfeature.LAND, facecolor='#f5f5eb', zorder=0)
        ax.add_feature(cfeature.LAKES, facecolor='#a8d4ff', linewidth=0.4)

        ax.add_feature(cfeature.NaturalEarthFeature(
            'cultural', 'admin_0_countries', '10m',
            edgecolor='black', facecolor='none', linewidth=0.9
        ))

        ax.gridlines(draw_labels=True, linestyle='--', alpha=0.35)

        # Title
        ax.set_title(
            f"10 m Wind Speed & Direction – Full Domain\n{self.selected_time}",
            fontsize=14
        )

        # North arrow
        self.add_north_arrow(ax)

        # Save
        os.makedirs(self.out_dir, exist_ok=True)
        out_file = os.path.join(
            self.out_dir,
            f"{os.path.basename(self.out_dir)}_wind_map.png"
        )

        plt.tight_layout()
        plt.savefig(out_file, dpi=300)
        plt.close(fig)

        print(f"Saved: {out_file}")

    def add_north_arrow(self, ax, position=(0.95, 0.14), size=15):
        ax.annotate(
            'N',
            xy=(position[0], position[1] + 0.09),
            xycoords='axes fraction',
            ha='center',
            fontsize=size,
            fontweight='bold'
        )
        ax.annotate(
            '',
            xy=(position[0], position[1] + 0.04),
            xytext=(position[0], position[1]),
            xycoords='axes fraction',
            arrowprops=dict(facecolor='black', width=3, headwidth=10)
        )


# RUN
if __name__ == "__main__":
    ds = xr.open_dataset(
        "/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-25_15:00:00",
        engine="netcdf4"
    )

    mapper = WindMapper(
        ds,
        out_dir="/home/haron/kmd/generated_maps/2026_02_25_1500"
    )

    mapper.load_data()
    mapper.generate_map()