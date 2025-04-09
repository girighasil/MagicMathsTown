import { useQuery } from "@tanstack/react-query";

export function useSiteConfig() {
  const { data, isLoading, error } = useQuery<Record<string, any>>({
    queryKey: ['/api/site-config'],
    staleTime: 60000, // 1 minute
  });

  return {
    config: data || {},
    isLoading,
    error,
  };
}

export function useSiteConfigKey(key: string) {
  const { data, isLoading, error } = useQuery<{ key: string; value: any }>({
    queryKey: ['/api/site-config', key],
    staleTime: 60000, // 1 minute
  });

  return {
    value: data?.value,
    isLoading,
    error,
  };
}