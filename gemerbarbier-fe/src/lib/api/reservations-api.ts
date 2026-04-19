/**
 * Reservations API Client
 * Endpoint: /api/reservations
 */

import { httpClient, buildQueryString, type ApiResponse } from './http-client';

// ============= Types =============

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  barberId: string;
  serviceId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  barberId: number;
  serviceId: number;
  startTime: string; // ISO date-time
  note?: string;
}

export interface UpdateReservationRequest {
  id: string;
  status?: ReservationStatus;
  date?: string;
  time?: string;
}

export interface ReservationFilters {
  barberId?: string;
  date?: string;
  status?: ReservationStatus;
}

// ============= API Methods =============

/**
 * Get all reservations with optional filters
 * GET /api/reservations
 */
export async function getReservations(
  filters?: ReservationFilters
): Promise<ApiResponse<Reservation[]>> {
  const query = filters ? buildQueryString(filters as Record<string, string | undefined>) : '';
  return httpClient<Reservation[]>(`/reservations${query}`);
}

/**
 * Get a single reservation by ID
 * GET /api/reservations/{id}
 */
export async function getReservationById(
  id: string
): Promise<ApiResponse<Reservation>> {
  return httpClient<Reservation>(`/reservations/${id}`);
}

/**
 * Create a new reservation
 * POST /api/reservations
 */
export async function createReservation(
  data: CreateReservationRequest
): Promise<ApiResponse<Reservation>> {
  return httpClient<Reservation>('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing reservation
 * PUT /api/reservations/{id}
 */
export async function updateReservation(
  data: UpdateReservationRequest
): Promise<ApiResponse<Reservation>> {
  const { id, ...body } = data;
  return httpClient<Reservation>(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Cancel a reservation
 * PATCH /api/reservations/{id}/cancel
 */
export async function cancelReservation(
  id: string
): Promise<ApiResponse<{ success: boolean }>> {
  return httpClient<{ success: boolean }>(`/reservations/${id}/cancel`, {
    method: 'PATCH',
  });
}

/**
 * Delete a reservation (admin only)
 * DELETE /api/reservations/{id}
 */
export async function deleteReservation(
  id: string
): Promise<ApiResponse<{ success: boolean }>> {
  return httpClient<{ success: boolean }>(`/reservations/${id}`, {
    method: 'DELETE',
  });
}

// ============= API Object Export =============

export const reservationsApi = {
  getAll: getReservations,
  getById: getReservationById,
  create: createReservation,
  update: updateReservation,
  cancel: cancelReservation,
  delete: deleteReservation,
};
