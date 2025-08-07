import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useCallback } from "react";

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  ...options
}: OptimizedQueryOptions<T>) {
  const memoizedQueryFn = useCallback(queryFn, []);

  return useQuery({
    queryKey,
    queryFn: memoizedQueryFn,
    staleTime,
    cacheTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
}
