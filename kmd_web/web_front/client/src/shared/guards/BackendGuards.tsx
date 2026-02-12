import { useQuery } from "@tanstack/react-query";
import { checkBackendHealth } from "@/lib/api";

export function BackendGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useQuery({
    queryKey: ["backend-health"],
    queryFn: checkBackendHealth,
    retry: 1,
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking backend status…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        Backend service is unavailable.
      </div>
    );
  }

  return <>{children}</>;
}
