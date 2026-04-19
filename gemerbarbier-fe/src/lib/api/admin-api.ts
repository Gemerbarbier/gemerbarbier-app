/**
 * Admin API Client
 * Endpoints for admin time slots and reservations management
 */

import { httpClient, type ApiResponse } from './http-client';

// ============= Types =============

export interface TimeSlotAdmin {
  id: number;
  startTime: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RESERVED';
}

export interface TimeSlotStatusUpdateRequest {
  slotIds: number[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ReservationAdmin {
  id: number;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  cutServiceName: string;
  note?: string;
  status: 'CREATED' | 'CANCELLED';
}

export interface ReservationCreateAdminRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  barberId: number;
  serviceId: number;
  startTime: string; // ISO date-time
  note?: string;
}

// ============= API Methods =============

/**
 * Get time slots for a barber on a specific date
 * GET /admin/barbers/{barberId}/time-slots?date={date}
 */
export async function getAdminTimeSlots(
    barberId: string,
    date: string
): Promise<ApiResponse<TimeSlotAdmin[]>> {
  return httpClient<TimeSlotAdmin[]>(`/admin/barbers/${barberId}/time-slots?date=${date}`);
}

/**
 * Update time slot status (ACTIVE/INACTIVE)
 * PATCH /admin/time-slots/{slotId}/status
 */
export async function updateTimeSlotStatus(
    slotId: number,
    data: TimeSlotStatusUpdateRequest
): Promise<ApiResponse<void>> {
  return httpClient<void>(`/admin/time-slots/${slotId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Get admin reservations for a specific date
 * GET /admin/reservations?barberId={barberId}&date={date}
 */
export async function getAdminReservations(
    barberId: string,
    date: string
): Promise<ApiResponse<ReservationAdmin[]>> {
  return httpClient<ReservationAdmin[]>(`/admin/reservations?barberId=${barberId}&date=${date}`);
}

/**
 * Create a reservation as admin
 * POST /admin/reservations
 */
export async function createAdminReservation(
    data: ReservationCreateAdminRequest
): Promise<ApiResponse<void>> {
  return httpClient<void>('/admin/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Deactivate all time slots for a specific day
 * PATCH /admin/barbers/{barberId}/time-slots/deactivate?date={date}
 */
export async function deactivateAllTimeSlots(
    barberId: string,
    date: string
): Promise<ApiResponse<void>> {
  return httpClient<void>(`/admin/barbers/${barberId}/time-slots/deactivate?date=${date}`, {
    method: 'PATCH',
  });
}

/**
 * Cancel a reservation
 * PATCH /admin/reservations/{reservationId}/cancel
 */
export async function cancelAdminReservation(
    reservationId: number
): Promise<ApiResponse<void>> {
  return httpClient<void>(`/admin/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
  });
}

// ============= API Object Export =============

export const adminApi = {
  getTimeSlots: getAdminTimeSlots,
  updateTimeSlotStatus,
  getReservations: getAdminReservations,
  createReservation: createAdminReservation,
  cancelReservation: cancelAdminReservation,
  deactivateAllTimeSlots,
};
