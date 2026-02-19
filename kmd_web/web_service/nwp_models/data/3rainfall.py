"""
----------------------------------------------------------
Spatial Rainfall Map Class (Full Grid, Single Time)
- Loads WRF NetCDF (single timestep)
- Uses full spatial domain from WRF
- Uses USER-SUPPLIED GeoJSON to show geographical boundaries
- Creates ONE rainfall accumulation map
- Improved coordinate handling & GeoJSON layering
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
        self.selected_time = "WRF single timestep"
        self.geo_gdf = None
        self.geo_feature = None

    def load_data(self):
        """Load WRF output and compute accumulated rainfall (RAINNC + RAINC)"""
        self.ds = xr.open_dataset(self.nc_path, engine="netcdf4")

        # Print original variable/coord names for debugging
        print("Original variables:", list(self.ds.data_vars))
        print("Original coords:   ", list(self.ds.coords))

        # Safe renaming: only rename if uppercase version exists and lowercase doesn't
        rename_dict = {}
        for name in list(self.ds.variables):
            lower = name.lower()
            if name != lower and lower not in self.ds.variables:
                rename_dict[name] = lower

        if rename_dict:
            self.ds = self.ds.rename(rename_dict)
            print("Renamed variables/coords:", rename_dict)

        # Access rainfall variables flexibly
        rainc = self.ds.get("rainc") or self.ds.get("RAINC")
        rainnc = self.ds.get("rainnc") or self.ds.get("RAINNC")

        if rainc is None or rainnc is None:
            raise ValueError("Could not find RAINC/RAINNC or rainc/rainnc in dataset")

        # Single timestep → 2D field
        rain = (rainc + rainnc).isel(Time=0)

        # Mask very low values (optional threshold – here 0.1 mm)
        self.rain = rain.where(rain >= 0.1)

        if self.rain.isnull().all():
            print("Warning: No rainfall ≥ 0.1 mm in this timestep")
        else:
            print(f"Rainfall range: {float(self.rain.min()):.2f} – {float(self.rain.max()):.2f} mm")

    def load_geojson(self):
        """Load GeoJSON file and prepare cartopy feature"""
        gdf = gpd.read_file(self.geojson_path)

        # Force to WGS84 / PlateCarree
        if gdf.crs is None or gdf.crs.to_epsg() != 4326:
            print("Converting GeoJSON to EPSG:4326")
            gdf = gdf.to_crs(epsg=4326)

        self.geo_gdf = gdf

        self.geo_feature = ShapelyFeature(
            gdf.geometry,
            ccrs.PlateCarree(),
            edgecolor='black',
            facecolor='none',
            linewidth=0.8,
            linestyle='-'
        )

        bounds = gdf.total_bounds
        print(f"GeoJSON bounds: [{bounds[0]:.2f}, {bounds[2]:.2f}] × [{bounds[1]:.2f}, {bounds[3]:.2f}]")

    def generate_map(self):
        """Create the rainfall map using WRF grid + GeoJSON boundaries"""
        fig = plt.figure(figsize=(13, 9))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # ───────────────────────────────────────────────
        # 1. Determine domain extent from WRF coordinates
        # ───────────────────────────────────────────────
        # Use safe coordinate name lookup
        lat_var = next((v for v in ['xlat', 'lat', 'latitude', 'XLAT'] if v in self.ds.coords), None)
        lon_var = next((v for v in ['xlong', 'lon', 'longitude', 'XLONG'] if v in self.ds.coords), None)

        if not lat_var or not lon_var:
            raise ValueError("Could not find latitude/longitude coordinates (xlat/xlong, XLAT/XLONG, etc.)")

        lats = self.ds[lat_var].isel(Time=0)
        lons = self.ds[lon_var].isel(Time=0)

        # WRF domain extent (with small buffer)
        buffer = 0.1
        ax.set_extent([
            float(lons.min()) - buffer,
            float(lons.max()) + buffer,
            float(lats.min()) - buffer,
            float(lats.max()) + buffer
        ], crs=ccrs.PlateCarree())

        # ───────────────────────────────────────────────
        # 2. Plot rainfall field
        # ───────────────────────────────────────────────
        if self.rain is not None and not self.rain.isnull().all():
            rmin = float(self.rain.min())
            rmax = float(self.rain.max())
            if rmax - rmin < 0.5:
                rmax += 0.5  # avoid flat color

            N_COLORS = 32
            levels = np.linspace(rmin, rmax, N_COLORS + 1)

            cmap = colormaps["turbo"].resampled(N_COLORS)
            cmap.set_bad("none")       # transparent where masked
            cmap.set_under("white")    # very low values

            cf = ax.contourf(
                lons.values,
                lats.values,
                self.rain.values,
                levels=levels,
                cmap=cmap,
                extend="max",
                transform=ccrs.PlateCarree(),
                zorder=1,
                antialiased=True
            )

            cbar = plt.colorbar(
                cf,
                ax=ax,
                shrink=0.75,
                pad=0.04,
                orientation="vertical",
                label="Accumulated Rainfall (mm)",
                format="%.1f"
            )
        else:
            ax.text(0.5, 0.5, "No significant rainfall\n(< 0.1 mm)",
                    transform=ax.transAxes, ha="center", va="center",
                    fontsize=16, color="darkred", fontweight="bold")

        # ───────────────────────────────────────────────
        # 3. Add GeoJSON boundaries (on top)
        # ───────────────────────────────────────────────
        if self.geo_feature is not None:
            ax.add_feature(self.geo_feature, zorder=10)

        # ───────────────────────────────────────────────
        # 4. Gridlines, title, north arrow
        # ───────────────────────────────────────────────
        gl = ax.gridlines(draw_labels=True, linestyle="--", alpha=0.45, color='gray')
        gl.top_labels = False
        gl.right_labels = False

        ax.set_title(
            f"WRF Accumulated Rainfall – Full Domain\n{self.selected_time}",
            fontsize=15, pad=18, fontweight="semibold"
        )

        self.add_north_arrow(ax, position=(0.94, 0.12), size=16)

        # ───────────────────────────────────────────────
        # Save
        # ───────────────────────────────────────────────
        out_file = "wrf_rainfall_single_timestep_full_domain.png"
        plt.tight_layout()
        plt.savefig(out_file, dpi=350, bbox_inches="tight", facecolor="white")
        plt.close(fig)

        print(f"Map saved: {out_file}")

    def add_north_arrow(self, ax, position=(0.95, 0.15), size=14):
        ax.annotate(
            "N", xy=(position[0], position[1] + 0.08),
            xycoords="axes fraction", ha="center", va="center",
            fontsize=size, fontweight="bold", color="black", zorder=20
        )
        ax.annotate(
            "", xy=(position[0], position[1] + 0.03),
            xytext=(position[0], position[1]),
            xycoords="axes fraction", textcoords="axes fraction",
            arrowprops=dict(facecolor="black", edgecolor="none",
                            width=3.5, headwidth=12, headlength=12),
            zorder=20
        )


# ----------------------------------------------------------
# Main execution
# ----------------------------------------------------------
if __name__ == "__main__":
    mapper = CountyRainfallMapper(
        nc_path="/home/haron/kmd/nwp_models_data/wrfout_d01_2026-02-11_13:00:00",
        geojson_path="/home/haron/kmd/nwp_models_data/eastafrica.geojson"
    )

    try:
        mapper.load_data()
        mapper.load_geojson()
        mapper.generate_map()
    except Exception as e:
        print(f"Error during execution: {e}")