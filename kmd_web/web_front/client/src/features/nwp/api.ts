// nwp/api.ts
import axios from "axios";

/**
 * NWP Model interface
 */
export interface NWPModel {
  id: string | number;
  name: string;
  description?: string;
  status?: "pending" | "live" | "deprecated";
  resolution?: string;
  updateFrequency?: string;
  path?: string;
  apiEndpoint: string;
}

/**
 * Fetch all NWP models from backend
 */
export async function getNWPModels(): Promise<NWPModel[]> {
  try {
    const response = await axios.get<NWPModel[]>("/api/nwp_models/list-models/");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch NWP models:", err);
    return [];
  }
}

/**
 * Fetch available timestamps (datetimes) for a specific model
 * @param modelId ID of the model
 */
export async function getAvailableTimes(modelId: string | number): Promise<string[]> {
  try {
    const response = await axios.get<string[]>(`/api/nwp/${modelId}/available-times/`);
    return response.data;
  } catch (err) {
    console.error(`Failed to fetch available times for model ${modelId}:`, err);
    return [];
  }
}

/**
 * Fetch metadata for a specific model
 * @param modelId ID of the model
 */
export async function getModelMetadata(modelId: string | number): Promise<Record<string, any> | null> {
  try {
    const response = await axios.get(`/api/nwp/${modelId}/metadata/`);
    return response.data;
  } catch (err) {
    console.error(`Failed to fetch metadata for model ${modelId}:`, err);
    return null;
  }
}

/**
 * Fetch the actual map/image URL for a given model, datetime, and variable
 */
export function getWrfImageUrl(modelId: string | number, datetime: string, variable: string): string {
  const encodedVariable = encodeURIComponent(variable);
  return `/api/nwp_models/${modelId}/field/?datetime=${datetime}&variable=${encodedVariable}`;
}