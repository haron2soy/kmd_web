"""
----------------------------------------------------------
Spatial Temperature Map Class
- Loads NetCDF
- Selects time
- Selects county
- Creates zoomed temperature map
----------------------------------------------------------
"""

import xarray as xr
import matplotlib
matplotlib.use('Agg')  # Non-GUI backend

import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import geopandas as gpd
from cartopy.feature import ShapelyFeature
from datetime import datetime
import numpy as np


class CountyTemperatureMapper:
    def __init__(self, nc_path, shp_path):
        self.nc_path = nc_path
        self.shp_path = shp_path
        self.ds = None
        self.temp = None
        self.temp_celsius = None
        self.kenya_counties = None
        self.single_county = None
        self.time_index = None
        self.selected_time = None

    # ---------------------------
    # Load dataset and shapefile
    # ---------------------------
    def load_data(self):
        self.ds = xr.open_dataset(self.nc_path, engine='netcdf4')
        self.ds = self.ds.rename({name: name.lower() for name in list(self.ds.data_vars) + list(self.ds.coords)})
        self.temp = self.ds['t2m']
        self.kenya_counties = gpd.read_file(self.shp_path)


    def choose_time(self, dt_string):
        """
        Select time by 'yyyy-mm-dd-hh'.
        Finds the nearest available time index in the NetCDF dataset.
        """
        try:
            # Parse user input
            user_dt = datetime.strptime(dt_string, "%Y-%m-%d-%H")
        except ValueError:
            raise ValueError(f"Invalid datetime format: {dt_string}. Use yyyy-mm-dd-hh")

        # Convert dataset valid_time to numpy datetime64 for comparison
        valid_times = self.temp.valid_time.values  # array of numpy.datetime64

        # Find index of closest time
        nearest_index = int(np.abs(valid_times - np.datetime64(user_dt)).argmin())

        # Select the slice
        temp_slice = self.temp.isel(valid_time=nearest_index)
        self.time_index = nearest_index
        self.selected_time = temp_slice.valid_time.values
        self.temp_celsius = temp_slice - 273.15

        # Chose month
    def choose_month(self, month_string):
        """
        Select a month by 'yyyy-mm'.
        Computes the average temperature of the month for plotting.
        """
        from datetime import datetime
        import numpy as np

        try:
            # Parse user input
            user_dt = datetime.strptime(month_string, "%Y-%m")
        except ValueError:
            raise ValueError(f"Invalid month format: {month_string}. Use yyyy-mm")

        # Convert NetCDF times to datetime64
        times = self.temp.valid_time.values  # array of np.datetime64

        # Extract year and month of each time step
        years = np.array([t.astype('datetime64[Y]').astype(int) + 1970 for t in times])
        months = np.array([t.astype('datetime64[M]').astype(int) % 12 + 1 for t in times])

        # Find all indices matching the user year & month
        indices = np.where((years == user_dt.year) & (months == user_dt.month))[0]

        if len(indices) == 0:
            raise ValueError(f"No data found for {month_string}")

        # Average over selected month
        temp_month = self.temp.isel(valid_time=indices).mean('valid_time')
        self.temp_celsius = temp_month - 273.15
        self.selected_time = f"{month_string} (Monthly Avg)"

    # ---------------------------
    # Select county
    # ---------------------------
    def select_county(self, county_name):
        # Case-insensitive match
        matches = self.kenya_counties[
            self.kenya_counties["NAME_1"].str.lower() == county_name.lower()
        ]
        if matches.empty:
            raise ValueError(f"County '{county_name}' not found.")
        
        self.single_county = matches

        

    # ---------------------------
    # Create map
    # ---------------------------
    def generate_map(self, county_name):
        fig = plt.figure(figsize=(12, 8))
        ax = plt.axes(projection=ccrs.PlateCarree())

        # -----------------------------------------
        # MODE 1: Full Kenya (no county selected)
        # -----------------------------------------
        if county_name is None:
            # Full country bounding box
            minx, miny, maxx, maxy = self.kenya_counties.total_bounds
            ax.set_extent([minx, maxx, miny, maxy], crs=ccrs.PlateCarree())

        # -----------------------------------------
        # MODE 2: Kenya selected
        # -----------------------------------------
        elif county_name.lower() == "kenya":
            # Full Kenya map, show county borders
            minx, miny, maxx, maxy = self.kenya_counties.total_bounds
            ax.set_extent([minx, maxx, miny, maxy], crs=ccrs.PlateCarree())
            
            counties_overlay = ShapelyFeature(
            self.kenya_counties.geometry,
            ccrs.PlateCarree(),
            edgecolor="black",
            facecolor="none",
            linewidth=0.8
            )
            ax.add_feature(counties_overlay)

        # -----------------------------------------
        # MODE 3: Specific county selected
        # -----------------------------------------
        else:
            minx, miny, maxx, maxy = self.single_county.total_bounds
            ax.set_extent([minx, maxx, miny, maxy], crs=ccrs.PlateCarree())

           # print("checking min max:", minx, miny, maxx, maxy)


            # County outline
            county_overlay = ShapelyFeature(
                self.single_county.geometry,
                ccrs.PlateCarree(),
                edgecolor="black",
                facecolor="none",
                linewidth=1.4
            )
            ax.add_feature(county_overlay)

        # -----------------------------------------
        # Temperature Contours
        # -----------------------------------------
        # 1. Detect min/max from the dataset
        tmin = 10.0 #float(self.temp_celsius.min())
        tmax = 40.0 #float(self.temp_celsius.max())
        
        lons = self.temp_celsius.longitude
        lats = self.temp_celsius.latitude
        
        
        lons_arr = self.temp_celsius.longitude.values
        GRID_lon = abs(lons_arr[1] - lons_arr[0])
        #print("GRID_lon", GRID_lon)
        lats_arr = self.temp_celsius.latitude.values
        GRID_lat = abs(lats_arr[1] - lats_arr[0])   # spacing in latitude
        #print("GRID_lat", GRID_lat)
        
        minx = np.floor(minx / GRID_lon) * GRID_lon
        maxx = np.ceil(maxx / GRID_lon) * GRID_lon
        miny = np.floor(miny / GRID_lat) * GRID_lat
        maxy = np.ceil(maxy / GRID_lat) * GRID_lat

        lons_in_bounds = lons[(lons >= minx) & (lons <= maxx)]
        lats_in_bounds = lats[(lats >= miny) & (lats <= maxy)]

        if len(lats_in_bounds) == 1:
            miny = lats_in_bounds[0] - GRID_lat
            maxy = lats_in_bounds[0] + GRID_lat
            # make sure you don’t go beyond dataset bounds
            miny = max(miny, lats_arr.min())
            maxy = min(maxy, lats_arr.max())
            lats_in_bounds = lats[(lats >= miny) & (lats <= maxy)]

        if len(lons_in_bounds) == 1:
            minx = lons_in_bounds[0] - GRID_lon
            maxx = lons_in_bounds[0] + GRID_lon
            minx = max(minx, lons_arr.min())
            maxx = min(maxx, lons_arr.max())
            lons_in_bounds = lons[(lons >= minx) & (lons <= maxx)]
        
        #print("values lon", lons_in_bounds.values)
        #print("values lat", lats_in_bounds.values)




        subset_temp = self.temp_celsius.sel(
            longitude=lons_in_bounds,
            latitude=lats_in_bounds
            )

        #print("Temperaturebounded:", subset_temp.values)
        # 1. Get min and max from the subset
        tmin = float(subset_temp.min())
        tmax = float(subset_temp.max())

        # 2. Set interval (step size for contour/color levels)
        #interval = 0.075

        # 3. Build the fixed levels array
        
        #print(f"tmin {tmin}, tmax {tmax} ")
        #print("countofvalues", subset_temp.values)
        # 2. Choose interval size (e.g., 1°C)
      
        N_COLORS = 30

        # 3. Build automatic contour levels
        #fixed_levels = np.arange(np.floor(tmin), np.ceil(tmax) + interval, interval)
       # 2. Number of color bins

        

        #fixed_levels = np.arange(tmin2, tmax2 + interval, interval)
        fixed_levels = np.linspace(tmin, tmax, N_COLORS + 1)

        # 4. Colors: number of color bins = number of intervals
        #N_COLORS = len(fixed_levels) - 1
        discrete_cmap = plt.cm.get_cmap("turbo", N_COLORS)

        # 5. Draw contourf
        levels = plt.contourf(
            subset_temp.longitude,
            subset_temp.latitude,
            subset_temp,
            levels=fixed_levels,
            cmap=discrete_cmap,
            extend="both",
            transform=ccrs.PlateCarree()
        )
        if subset_temp.latitude.size <= 5:  # typical for Nairobi area
                    fine_lat = np.linspace(subset_temp.latitude.min().item(), subset_temp.latitude.max().item(), 200)
                    subset_smooth = subset_temp.interp(latitude=fine_lat, method='linear')
                    
                    subset_smooth.plot.contourf(
                        ax=ax,
                        levels=fixed_levels,
                        cmap=discrete_cmap,
                        extend='both',
                        add_colorbar=False,
                        transform=ccrs.PlateCarree(),
                        alpha=0.9
                    )
                    print("Applied visual interpolation (linear) for smoother appearance")
        plt.colorbar(levels, shrink=0.7, pad=0.05, label='Temperature (°C)')



        # Base layers
        ax.coastlines(resolution='10m', linewidth=0.8)
        ax.add_feature(cfeature.BORDERS, color='black', linestyle=':', alpha=0.7)
        ax.add_feature(cfeature.OCEAN, color='lightblue', alpha=0.5)
        ax.add_feature(cfeature.LAND, color='lightgray', alpha=0.5)
        #ax.add_feature(cfeature.RIVERS, edgecolor='blue')
        ax.add_feature(cfeature.LAKES, edgecolor='black', facecolor='lightblue')
        ax.gridlines(draw_labels=True, alpha=0.5, linestyle='--')

        # Title
        time_str = str(self.selected_time).replace(':', '-')
        area = county_name if county_name else "Kenya (All Counties)"
        ax.set_title(f"2m Air Temperature – {self.selected_time} | {area}", fontsize=14, pad=20)

        # Output file name
        safe_area = area.replace(" ", "_")
        out_file = f"{time_str}_{safe_area}_temperature_map.png"

        self.add_north_arrow(ax)
        plt.tight_layout()
        plt.savefig(out_file, dpi=300, bbox_inches='tight')
        plt.close()

        #print(f"Saved: {out_file}")

    def print_current_map_values(self):
        """
        Print or return the temperature values of the current selected slice (hourly or monthly average).
        """
        import pandas as pd
        temps = self.temp_celsius.values
        lats = self.temp_celsius.latitude.values
        lons = self.temp_celsius.longitude.values

        df = pd.DataFrame({
            'lat': np.repeat(lats, len(lons)),
            'lon': np.tile(lons, len(lats)),
            'temp_C': temps.flatten()
        })
        #print(df)
        #df.to_csv(f"{self.selected_time}monthly_avg_temperature.csv", index=False)
        return df
    def add_north_arrow(self, ax, position=(0.95, 0.15), size=14):
        """
        Draw a small north arrow (compass) on the map.

        Parameters
        ----------
        ax : matplotlib axis
            The axis on which to draw the arrow.
        position : tuple (x, y)
            Position in axis fraction coordinates (0–1).
        size : int
            Font size for the 'N' label.
        """
        ax.annotate(
            'N',
            xy=(position[0], position[1] + 0.1),  # Text slightly above arrow
            xytext=(position[0], position[1] + 0.1),
            xycoords='axes fraction',
            textcoords='axes fraction',
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
            textcoords='axes fraction',
            arrowprops=dict(facecolor='black', width=3, headwidth=10)
        )

# ----------------------------------------------------------
# __main__ entry point
# ----------------------------------------------------------
if __name__ == "__main__":
    import sys

    # --- CLI arguments ---
    # Usage: python spatial84.py <yyyy-mm1> [<yyyy-mm2> ...] [county]
    # Example: python spatial84.py 2020-01 2020-02 Nairobi
    # If county is blank or "all", the whole country is shown.

    if len(sys.argv) < 2:
        print("Usage: python spatial101.py <yyyy-mm1> [<yyyy-mm2> ...] [county]")
        sys.exit(1)

    # All arguments except the last one are assumed to be dates unless the last is non-date
    args = sys.argv[1:]
    county = "all"  # default

    # Check if last argument looks like a county (non-date)
    try:
        # Try parsing last argument as yyyy-mm
        import datetime
        datetime.datetime.strptime(args[-1], "%Y-%m")
        # Last argument is a date → all are dates, county remains default
        date_strings = args
    except ValueError:
        # Last argument is county
        county = args[-1]
        date_strings = args[:-1]

    if len(date_strings) == 0:
        print("No valid date strings provided.")
        sys.exit(1)

    mapper = CountyTemperatureMapper(
        nc_path="/home/haron/kmd/nwp_models_data/data_stream-enda_stepType-instant.nc",
        shp_path="/mnt/g/DriveD/kmd/gadm41_KEN_shp/gadm41_KEN_1.shp"
    )
    mapper.load_data()

    # Loop over all yyyy-mm inputs
    for date_string in date_strings:
        #print(f"\nProcessing {date_string} ...")
        mapper.choose_month(date_string)
        mapper.print_current_map_values()

        if county.lower() != "all" and county.lower() != "kenya" and county.strip() != "":
            mapper.select_county(county)
            mapper.generate_map(county)
            print(f"map for {county}")

        elif county.lower() == "kenya":
            mapper.generate_map(county)
            print("map for Kenya")

        else:
            mapper.generate_map(None)
            print("map for entire country")
