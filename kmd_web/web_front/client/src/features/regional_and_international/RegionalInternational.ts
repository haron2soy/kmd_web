// src/features/regional_and_international/RegionalInternational.tsx
export type ServiceItem = {
  name: string;
  url: string;
  slug: string; // used in route e.g. /national/kenya
};

export const RegionalInternational: ServiceItem[] = [
  { name: "ECMWF", url: "https://www.ecmwf.int", slug: "ecmwf" },
  { name: "Noaa-Ncep", url: "https://www.cpc.ncep.noaa.gov/products/international/eafrica/eafrica.shtml", slug: "noaa-ncep" },
  { name: "UK Met Office", url: "https://www.metoffice.gov.uk", slug: "uk-met" },
  { name: "DWD", url: "https://www.dwd.de/DE/Home/home_node.html", slug: "dwd" },
  { name: "ACMAD", url: "https://acmad.org/", slug: "acmad" },
  { name: "KMA", url: "https://www.kma.go.kr/neng/index.do", slug: "kma" },
  { name: "ICPAC", url: "https://www.icpac.net/", slug: "icpac" },
  
  
  
  
  // add more countries here
];