/**
 * Time Slots API Client
 * Endpoint: /available-slots
 */

import { httpClient, buildQueryString, type ApiResponse } from './http-client';

// ============= Types =============

export interface AvailableTimeSlotResponse {
  date: string;
  timeList: string[];
}

export interface GetAvailableSlotsRequest {
  barberId: string;
  serviceId: string;
}

// Legacy types kept for compatibility
export interface TimeSlot {
  id: string;
  barberId: string;
  date: string;
  time: string;
  isAvailable: boolean;
  isRemoved: boolean;
}

export interface GetTimeSlotsRequest {
  barberId: string;
  date: string;
}

export interface GetTimeSlotsResponse {
  slots: TimeSlot[];
}

export interface BulkUpdateRequest {
  slots: Array<{ slotId: string; isRemoved: boolean }>;
}

// ============= API Methods =============

/**
 * Get available time slots for a barber and service
 * GET /available-slots?barberId={barberId}&serviceId={serviceId}
 */
export async function getAvailableSlots(
  params: GetAvailableSlotsRequest
): Promise<ApiResponse<AvailableTimeSlotResponse[]>> {
  const query = buildQueryString({ barberId: params.barberId, serviceId: params.serviceId });
  return httpClient<AvailableTimeSlotResponse[]>(`/available-slots${query}`);
}

/**
 * @deprecated Use getAvailableSlots instead
 */
export async function getAvailableTimeSlots(
  params: GetTimeSlotsRequest
): Promise<ApiResponse<GetTimeSlotsResponse>> {
  const query = buildQueryString({ barberId: params.barberId, date: params.date });
  return httpClient<GetTimeSlotsResponse>(`/time-slots${query}`);
}

/**
 * Remove a time slot from availability
 * PATCH /time-slots/{id}/remove
 */
export async function removeTimeSlot(
  slotId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return httpClient<{ success: boolean }>(`/time-slots/${slotId}/remove`, {
    method: 'PATCH',
  });
}

/**
 * Restore a previously removed time slot
 * PATCH /time-slots/{id}/restore
 */
export async function restoreTimeSlot(
  slotId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return httpClient<{ success: boolean }>(`/time-slots/${slotId}/restore`, {
    method: 'PATCH',
  });
}

/**
 * Bulk update time slots
 * PUT /time-slots/bulk
 */
export async function bulkUpdateTimeSlots(
  data: BulkUpdateRequest
): Promise<ApiResponse<{ success: boolean }>> {
  return httpClient<{ success: boolean }>('/time-slots/bulk', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============= API Object Export =============

export const timeSlotsApi = {
  getAvailableSlots,
  getAvailable: getAvailableTimeSlots,
  remove: removeTimeSlot,
  restore: restoreTimeSlot,
  bulkUpdate: bulkUpdateTimeSlots,
};
