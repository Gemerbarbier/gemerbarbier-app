/**
 * Statistics API Client
 * Endpoint: /api/stats
 */

import { httpClient, buildQueryString, type ApiResponse } from './http-client';

// ============= Types =============

export type StatsPeriod = 'day' | 'week' | 'month' | 'year';

export interface StatsRequest {
  barberId?: string;
  period: StatsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface PopularService {
  serviceId: string;
  serviceName: string;
  count: number;
}

export interface DailyReservation {
  date: string;
  count: number;
}

export interface StatsResponse {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  revenue: number;
  popularServices: PopularService[];
  reservationsByDay: DailyReservation[];
}

export interface RevenueResponse {
  revenue: number;
  previousRevenue: number;
}

// ============= API Methods =============

/**
 * Get statistics for the dashboard
 * GET /api/stats
 */
export async function getStats(
  params: StatsRequest
): Promise<ApiResponse<StatsResponse>> {
  const query = buildQueryString({
    barberId: params.barberId,
    period: params.period,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  return httpClient<StatsResponse>(`/stats${query}`);
}

/**
 * Get revenue statistics
 * GET /api/stats/revenue
 */
export async function getRevenue(params: {
  period: 'week' | 'month' | 'year';
  barberId?: string;
}): Promise<ApiResponse<RevenueResponse>> {
  const query = buildQueryString(params);
  return httpClient<RevenueResponse>(`/stats/revenue${query}`);
}

// ============= API Object Export =============

export const statsApi = {
  get: getStats,
  getRevenue,
};
