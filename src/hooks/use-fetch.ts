"use client";

import { useState, useEffect, useCallback } from "react";

type FetchStatus = "idle" | "loading" | "success" | "error";

interface UseFetchOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchReturn<T> {
  data: T | null;
  status: FetchStatus;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus("loading");
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      setStatus("success");
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      setStatus("error");
      onError?.(error);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, status, error, refetch: execute };
}

interface UseDebounceOptions<T> {
  delay?: number;
  onChange?: (value: T) => void;
}

export function useDebounce<T>(value: T, delay = 300, options?: UseDebounceOptions<T>): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      options?.onChange?.(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, options]);

  return debouncedValue;
}
