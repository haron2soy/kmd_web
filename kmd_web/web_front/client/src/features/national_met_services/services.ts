// src/features/met-services/services.ts
export type ServiceItem = {
  name: string;
  url: string;
  slug: string; // used in route e.g. /national/kenya
};

export const services: ServiceItem[] = [
  { name: "Kenya", url: "https://meteo.go.ke/", slug: "kenya" },
  { name: "Ethiopia", url: "https://www.ethiomet.gov.et/", slug: "ethiopia" },
  { name: "Tanzania", url: "https://www.meteo.go.tz/", slug: "tanzania" },
  { name: "Rwanda", url: "https://www.meteorwanda.gov.rw/home", slug: "rwanda" },
  { name: "Burundi", url: "https://www.igebu.bi/", slug: "burundi" },
  { name: "South-Sudan", url: "", slug: "south-sudan" },
  { name: "Somalia", url: "https://meteosomalia.so", slug: "somalia" },
  { name: "Uganda", url: "https://meteo.mwe.go.ug/", slug: "uganda" },
  { name: "Sudan", url: "https://meteosudan.sd/", slug: "sudan" },
  { name: "Djibouti", url: "https://meteodjibouti.dj/", slug: "djibouti" },

  
  // add more countries here
];