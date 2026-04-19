/**
 * Services API Client
 * Endpoint: /api/services
 */

import { httpClient, type ApiResponse } from './http-client';

// ============= Types =============

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
}

// ============= API Methods =============

/**
 * Get all services
 * GET /api/services
 */
export async function getServices(): Promise<ApiResponse<Service[]>> {
  return httpClient<Service[]>('/services');
}

/**
 * Get a single service by ID
 * GET /api/services/{id}
 */
export async function getServiceById(id: string): Promise<ApiResponse<Service>> {
  return httpClient<Service>(`/services/${id}`);
}

// ============= API Object Export =============

export const servicesApi = {
  getAll: getServices,
  getById: getServiceById,
};
