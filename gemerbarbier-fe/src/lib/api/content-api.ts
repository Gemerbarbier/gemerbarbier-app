/**
 * Content API Client
 * Endpoints: /maps-config, /reviews
 *
 * These used to be Supabase edge functions; they now live in the Spring backend so the app has no
 * dependency on Supabase.
 */

import { httpClient, type ApiResponse } from './http-client';

// ============= Types =============

export interface MapsConfig {
  apiKey: string;
  placeId: string;
}

export interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  profilePhoto?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

// ============= API Methods =============

/**
 * Get the Google Maps configuration the browser needs to render the map
 * GET /maps-config
 */
export async function getMapsConfig(): Promise<ApiResponse<MapsConfig>> {
  return httpClient<MapsConfig>('/maps-config');
}

/**
 * Get the shop's Google reviews (cached server-side)
 * GET /reviews
 */
export async function getReviews(): Promise<ApiResponse<ReviewsResponse>> {
  return httpClient<ReviewsResponse>('/reviews');
}

// ============= API Object Export =============

export const contentApi = {
  getMapsConfig,
  getReviews,
};
