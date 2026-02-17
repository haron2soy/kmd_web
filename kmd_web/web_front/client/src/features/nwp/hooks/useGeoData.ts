// Hook to connect Django API → frontend
//src/features/components/useGeoData.tsx
import { useQuery } from "@tanstack/react-query";

export function useGeoData(variable: string, timeIndex: number) {
  return useQuery({
    queryKey: ["wrf", variable, timeIndex],
    queryFn: async () => {
      const res = await fetch(
        //`/api/nwp-models/grid/?variable=${variable}&time_index=${timeIndex}&file=wrf.nc`
        `/api/nwp-models/wrf/?variable=${variable}&time_index=${timeIndex}&file=wrfout_d01_2026-02-11_13:00:00`
      );

  
      if (!res.ok) throw new Error("Failed to fetch data");

      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
