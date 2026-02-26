import xarray as xr
import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib import colormaps
from matplotlib.colors import BoundaryNorm
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import numpy as np
import os

class WindMapper:
    """
    Spatial Wind Map Class (Full Grid, Single Time)
    - Uses 10 m winds if available
    - Creates full-domain wind speed + direction map
    - Adds geographical features similar to RainfallMapper
    """
    def __init__(self, ds, out_dir):
        self.ds = ds
        self.out_dir = out_dir

        self.u = None
        self.v = None
        self.wind_speed = None
        self.selected_time = "WRF single timestep"

    def load_data(self):
        # lowercase all variable and coordinate names
        self.ds = self.ds.rename(
            {name: name.lower() for name in list(self.ds.data_vars) + list(self.ds.coords)}
        )

        # Prefer 10 m winds
        if "u10" in self.ds and "v10" in self.ds:
            self.u = self.ds["u10"].isel(Time=0)
            self.v = self.ds["v10"].isel(Time=0)
        else:
            # fallback: lowest model level
            self.u = self.ds["u"].isel(Time=0, bottom_top=0)
            self.v = self.ds["v"].isel(Time=0, bottom_top=0)

        self.wind_speed = np.sqrt(self.u**2 + self.v**2)

    def generate_map(self):
        if self.wind_speed is None or np.all(np.isnan(self.wind_speed)):
            print("[WindMapper] No valid wind data. Skipping map.")
            return

        fig = plt.figure(figsize=(13, 9))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # Full grid coordinates
        lons = self.ds["xlong"].isel(Time=0).values
        lats = self.ds["xlat"].isel(Time=0).values

        ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())

        # -----------------------------
        # Map decorations (land, ocean, borders)
        # -----------------------------
        ax.coastlines(resolution='10m', linewidth=0.7, alpha=0.9)
        ax.add_feature(cfeature.BORDERS, linestyle='-', linewidth=0.8, alpha=0.7)
        ax.add_feature(cfeature.OCEAN, facecolor='#d8e8f5', zorder=0)
        ax.add_feature(cfeature.LAND, facecolor='#f5f5eb', zorder=0)
        ax.add_feature(cfeature.LAKES, facecolor='#a8d4ff', edgecolor='black', linewidth=0.4)
        ax.add_feature(cfeature.RIVERS, edgecolor='blue', linewidth=0.3, zorder=1)

        ax.add_feature(cfeature.NaturalEarthFeature(
            'cultural', 'admin_0_countries', '10m',
            edgecolor='black', facecolor='none', linewidth=0.9
        ))

        ax.gridlines(draw_labels=True, linestyle='--', alpha=0.35)

        # -----------------------------
        # Wind speed shading (contours)
        # -----------------------------
        levels = [0, 1, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50]
        cmap = colormaps["turbo"].resampled(len(levels)-1)
        norm = BoundaryNorm(levels, ncolors=len(levels)-1)

        cf = ax.contourf(
            lons, lats, self.wind_speed,
            levels=levels,
            cmap=cmap,
            norm=norm,
            extend="max",
            transform=ccrs.PlateCarree(),
            zorder=1
        )

        cbar = plt.colorbar(cf, ax=ax, shrink=0.7, pad=0.04)
        cbar.set_label("Wind Speed (m s⁻¹)", fontsize=11)
        cbar.ax.tick_params(labelsize=10)

        # -----------------------------
        # Wind arrows (thinned, improved readability)
        # -----------------------------
        skip = max(lons.shape[0]//40, 1)  # adjust density to ~40 arrows along axis
        ax.quiver(
            lons[::skip, ::skip],
            lats[::skip, ::skip],
            self.u.values[::skip, ::skip],
            self.v.values[::skip, ::skip],
            self.wind_speed.values[::skip, ::skip],  # color arrows by speed
            cmap="jet",
            scale=400,
            width=0.003,
            pivot="middle",
            transform=ccrs.PlateCarree(),
            zorder=2
        )

        # -----------------------------
        # North arrow
        # -----------------------------
        self.add_north_arrow(ax)

        # Title and save
        ax.set_title(f"10 m Wind Speed & Direction – Full Domain\n{self.selected_time}", fontsize=14, pad=20)

        os.makedirs(self.out_dir, exist_ok=True)
        out_file = os.path.join(self.out_dir, f"{os.path.basename(self.out_dir)}_wind_map.png")
        plt.tight_layout()
        plt.savefig(out_file, dpi=300, bbox_inches="tight")
        plt.close(fig)
        print(f"Saved: {out_file}")

    def add_north_arrow(self, ax, position=(0.95, 0.15), size=14):
        ax.annotate(
            "N",
            xy=(position[0], position[1]+0.1),
            xycoords="axes fraction",
            ha="center",
            va="center",
            fontsize=size,
            fontweight="bold",
            zorder=10
        )
        ax.annotate(
            "",
            xy=(position[0], position[1]+0.05),
            xytext=(position[0], position[1]),
            xycoords="axes fraction",
            arrowprops=dict(facecolor="black", width=3, headwidth=10),
            zorder=10
        )


# Example usage (uncomment when testing)
if __name__ == "__main__":
    ds = xr.open_dataset("/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-25_15:00:00")
    mapper = WindMapper(ds, out_dir="/home/haron/kmd/generated_maps/20260225_1500")
    mapper.load_data()
    mapper.generate_map()