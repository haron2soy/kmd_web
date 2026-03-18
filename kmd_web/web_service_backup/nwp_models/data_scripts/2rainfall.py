"""
----------------------------------------------------------
Spatial Rainfall Map Class (Full Grid, Single Time)
- Loads NetCDF
- Uses the only timestep
- Uses full spatial grid
- Uses USER GeoJSON as base map
- Creates ONE rainfall map
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


class CountyRainfallMapper:
    def __init__(self, nc_path, geojson_path):
        self.nc_path = nc_path
        self.geojson_path = geojson_path
        self.ds = None
        self.rain = None
        self.selected_time = None
        self.geo_feature = None

    # ---------------------------
    # Load dataset
    # ---------------------------
    def load_data(self):
        self.ds = xr.open_dataset(self.nc_path, engine="netcdf4")
        self.ds = self.ds.rename(
            {name: name.lower() for name in list(self.ds.data_vars) + list(self.ds.coords)}
        )

        # --- ONE timestep → 2D ---
        rain = (self.ds["rainc"] + self.ds["rainnc"]).isel(Time=0)

        # --- Mask zero rainfall (CRITICAL) ---
        self.rain = rain.where(rain > 0.0)

        self.selected_time = "WRF single timestep"

    # ---------------------------
    # Load GeoJSON (BASE MAP)
    # ---------------------------
    def load_geojson(self):
        gdf = gpd.read_file(self.geojson_path)

        # Ensure lat/lon
        if gdf.crs is None or gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)

        self.geo_feature = ShapelyFeature(
            gdf.geometry,
            ccrs.PlateCarree(),
            facecolor="none",
            edgecolor="black",
            linewidth=0.6
        )
        print(gdf.total_bounds)
        

    # ---------------------------
    # Create map (FULL GRID)
    # ---------------------------
    def generate_map(self):
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
        # Draw USER GeoJSON (BASE MAP)
        # -----------------------------------------
        ax.add_feature(self.geo_feature, zorder=3)

        # -----------------------------------------
        # Rainfall contours
        # -----------------------------------------
        rmin = float(self.rain.min())
        rmax = float(self.rain.max())

        N_COLORS = 30
        levels = np.linspace(rmin, rmax, N_COLORS + 1)

        cmap = colormaps["turbo"].resampled(N_COLORS)
        cmap.set_bad("none")  # transparent zeros

        cf = ax.contourf(
            lons.values,
            lats.values,
            self.rain,
            levels=levels,
            cmap=cmap,
            extend="max",
            transform=ccrs.PlateCarree(),
            zorder=1
        )
        ax.add_feature(self.geo_feature, zorder=3)
        
        plt.colorbar(
            cf,
            shrink=0.7,
            pad=0.05,
            label="Accumulated Rainfall (mm)"
        )

        # -----------------------------------------
        # Gridlines only (NO Cartopy land)
        # -----------------------------------------
        ax.gridlines(draw_labels=True, linestyle="--", alpha=0.5)

        # -----------------------------------------
        # Title & output
        # -----------------------------------------
        ax.set_title(
            f"Accumulated Rainfall – Full Domain\n{self.selected_time}",
            fontsize=14,
            pad=20
        )

        out_file = "WRF_single_timestep_full_domain_rainfall_map.png"

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
if __name__ == "__main__":

    mapper = CountyRainfallMapper(
        nc_path="/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-11_13:00:00",
        geojson_path="/home/haron/kmd/nwp_models_data/eastafrica.geojson"
    )

    mapper.load_data()
    mapper.load_geojson()

    

    mapper.generate_map()
