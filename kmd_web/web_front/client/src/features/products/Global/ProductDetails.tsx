// src/features/regional_and_international/RegionalInternational.tsx
export type ServiceItem = {
  name: string;
  url: string;
  slug: string; // used in route e.g. /national/kenya
};

export const ProductDetails: ServiceItem[] = [
  { name: "Ncep Noaa E.A", url: "https://www.cpc.ncep.noaa.gov/products/international/eafrica/eafrica.shtml", slug: "cpc-ncep-noaa" },
  { name: "Zoom Earth Satelite", url: "https://zoom.earth/maps/satellite/", slug: "zoom-earth" },
  { name: "UK Met Office", url: "https://www.metoffice.gov.uk", slug: "uk-met" },
  { name: "EFI Precipitation", url: "https://charts.ecmwf.int/products/efi2web_tp?area=Africa&base_time=202603030000&day=1&quantile=99", slug: "efi-precipitation" },
  { name: "EFI Wave", url: "https://charts.ecmwf.int/products/efi2web_hsttmax?area=Southern%20Africa&base_time=202603030000&day=1&quantile=99", slug: "efi-wave" },
  {name: "EFI Wind Speed", url: "https://charts.ecmwf.int/products/efi2web_10ff?area=Africa&base_time=202603300000&day=1&quantile=99", slug: "efi-wind-speed"},
  { name: "GFS Precip 24h", url: "https://www.cpc.ncep.noaa.gov/products/international/cpci/data/00/gfs_precip_24h_eafrica.html", slug: "gfs-precip-24h" },
  { name: "EW4All Monitoring", url: "http://ew4all.wmc-bj.net/EW4ALL/monitor", slug: "ew4all-monitor" },
  { name: "NCEP Forecast East Africa", url: "https://www.cpc.ncep.noaa.gov/products/international/cpci/data/00/fcsts_eafrica.shtml", slug:"ncep-forecast-east-africa"},
  { name: "Tropical monitoring and outlooks", url: "https://www.bom.gov.au/climate/mjo/", slug: "tropical-monitoring-outlooks"},
  { name: "Cpc Ncep Noaa MJO Forecast", url: "https://www.cpc.ncep.noaa.gov/products/precip/CWlink/MJO/foregfs.shtml", slug: "mjo-forecast"},
  { name: "Eumetsat", url: "https://view.eumetsat.int/", slug: "eumetsat"},
  { name: "SA Synoptic Charts", url: "https://www.weathersa.co.za/home/synopticcharts", slug: "sa-synoptic-charts"},

  
  // add more countries here
  // add more countries here
];