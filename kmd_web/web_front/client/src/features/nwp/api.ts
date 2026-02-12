//import apiClient from "@/lib/apiClient";

export interface NWPModel {
  id: number | string;
  name: string;
  description: string;
  status?: "pending" | "live" | "deprecated";
  resolution?: string;
  updateFrequency?: string;
}

// Temporary mock response while backend is pending
export async function getNWPModels(): Promise<NWPModel[]> {
  // When backend is ready, replace with:
  // const response = await apiClient.get("/nwp-models/");
  // return response.data;

  return Promise.resolve([
    {
      id: 1,
      name: "WRF Regional Model",
      description: "High-resolution regional atmospheric model.",
      status: "pending",
    },
    {
      id: 2,
      name: "Global Deterministic Model",
      description: "Global forecast model for large-scale dynamics.",
      status: "pending",
    },
  ]);
}
