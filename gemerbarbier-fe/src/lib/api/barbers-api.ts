/**
 * Barbers API Client
 * Endpoint: /api/barbers
 */

import { httpClient, type ApiResponse } from './http-client';

// ============= Types =============

export interface Barber {
  id: string;
  name: string;
}

// ============= API Methods =============

/**
 * Get all barbers
 * GET /api/barbers
 */
export async function getBarbers(): Promise<ApiResponse<Barber[]>> {
  return httpClient<Barber[]>('/barbers');
}

/**
 * Get a single barber by ID
 * GET /api/barbers/{id}
 */
export async function getBarberById(id: string): Promise<ApiResponse<Barber>> {
  return httpClient<Barber>(`/barbers/${id}`);
}

// ============= API Object Export =============

export const barbersApi = {
  getAll: getBarbers,
  getById: getBarberById,
};
