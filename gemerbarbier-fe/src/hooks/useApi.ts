/**
 * React hooks for API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  type ApiResponse,
  type ApiError,
  getBarbers,
  getServices,
  getReservations,
  getAvailableTimeSlots,
  getStats,
  type GetTimeSlotsRequest,
  type StatsRequest,
  type ReservationFilters,
} from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: () => Promise<ApiResponse<T>>;
  reset: () => void;
}

/**
 * Generic hook for API calls
 */
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options?: {
    showErrorToast?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });
  const { toast } = useToast();

  const execute = useCallback(async (): Promise<ApiResponse<T>> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await apiCall();

    if (response.success && response.data) {
      setState({ data: response.data, isLoading: false, error: null });
      options?.onSuccess?.(response.data);
    } else {
      setState({ data: null, isLoading: false, error: response.error });
      
      if (options?.showErrorToast !== false && response.error) {
        toast({
          title: 'Chyba',
          description: response.error.message,
          variant: 'destructive',
        });
      }
      
      if (response.error) {
        options?.onError?.(response.error);
      }
    }

    return response;
  }, [apiCall, options, toast]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// ============= Specific API hooks =============

/**
 * Hook for fetching barbers
 */
export function useBarbers() {
  return useApiCall(() => getBarbers());
}

/**
 * Hook for fetching services
 */
export function useServices() {
  return useApiCall(() => getServices());
}

/**
 * Hook for fetching reservations
 */
export function useReservations(filters?: ReservationFilters) {
  return useApiCall(() => getReservations(filters));
}

/**
 * Hook for fetching time slots
 */
export function useTimeSlots(params: GetTimeSlotsRequest) {
  return useApiCall(() => getAvailableTimeSlots(params));
}

/**
 * Hook for fetching statistics
 */
export function useStats(params: StatsRequest) {
  return useApiCall(() => getStats(params));
}
