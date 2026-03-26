import { useBackendStatus } from "@/shared/guards/BackendStatus";

let failureCount = 0;

export async function fetchClient(input: RequestInfo, init?: RequestInit) {
  try {
    const res = await fetch(input, {
      ...init,
      credentials: "include",
    });

    if (res.ok) {
      failureCount = 0;
      useBackendStatus.getState().setStatus("up");
    } else if (res.status >= 500) {
      failureCount++;
    }

    if (failureCount >= 2) {
      useBackendStatus.getState().setStatus("down");
    }

    return res;
  } catch (err) {
    failureCount++;
    if (failureCount >= 2) {
      useBackendStatus.getState().setStatus("down");
    }
    throw err;
  }
}