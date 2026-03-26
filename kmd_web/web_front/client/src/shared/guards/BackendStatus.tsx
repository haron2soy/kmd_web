// src/shared/guards/BackendStatus.ts
import { create } from "zustand";

type Status = "up" | "down" | "checking";

type BackendState = {
  status: Status;
  setStatus: (s: Status) => void;
};

export const useBackendStatus = create<BackendState>((set) => ({
  status: "checking",
  setStatus: (status) => set({ status }),
}));