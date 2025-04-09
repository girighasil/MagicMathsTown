import { useQuery } from "@tanstack/react-query";

export function useSiteConfig() {
  const { data, isLoading, error, refetch } = useQuery<Record<string, any>>({
    queryKey: ['/api/site-config'],
    staleTime: 0, // Always refetch to get latest data
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });

  return {
    config: data || {},
    isLoading,
    error,
    refetch,
  };
}

export function useSiteConfigKey(key: string) {
  const { data, isLoading, error, refetch } = useQuery<{ key: string; value: any }>({
    queryKey: ['/api/site-config', key],
    staleTime: 0, // Always refetch to get latest data
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });

  return {
    value: data?.value,
    isLoading,
    error,
    refetch,
  };
}