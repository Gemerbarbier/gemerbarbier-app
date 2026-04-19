/**
 * API Module - Centralized exports for all API clients
 * 
 * Structure follows OpenAPI generated client pattern
 */

// HTTP Client utilities
export {
  httpClient,
  buildQueryString,
  setApiConfiguration,
  getApiConfiguration,
  type ApiConfiguration,
  type ApiResponse,
  type ApiError,
} from './http-client';

// Auth API
export {
  authApi,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  validateToken,
  type LoginRequest,
  type AuthResponse,
  type UserInfo,
} from './auth-api';

// Barbers API
export {
  barbersApi,
  getBarbers,
  getBarberById,
  type Barber,
} from './barbers-api';

// Services API
export {
  servicesApi,
  getServices,
  getServiceById,
  type Service,
} from './services-api';

// Time Slots API
export {
  timeSlotsApi,
  getAvailableSlots,
  getAvailableTimeSlots,
  removeTimeSlot,
  restoreTimeSlot,
  bulkUpdateTimeSlots,
  type AvailableTimeSlotResponse,
  type GetAvailableSlotsRequest,
  type TimeSlot,
  type GetTimeSlotsRequest,
  type GetTimeSlotsResponse,
  type BulkUpdateRequest,
} from './time-slots-api';

// Reservations API
export {
  reservationsApi,
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  deleteReservation,
  type Reservation,
  type ReservationStatus,
  type CreateReservationRequest,
  type UpdateReservationRequest,
  type ReservationFilters,
} from './reservations-api';

// Stats API
export {
  statsApi,
  getStats,
  getRevenue,
  type StatsRequest,
  type StatsResponse,
  type StatsPeriod,
  type PopularService,
  type DailyReservation,
  type RevenueResponse,
} from './stats-api';

import { authApi as authApiClient } from './auth-api';
import { barbersApi as barbersApiClient } from './barbers-api';
import { servicesApi as servicesApiClient } from './services-api';
import { timeSlotsApi as timeSlotsApiClient } from './time-slots-api';
import { reservationsApi as reservationsApiClient } from './reservations-api';
import { statsApi as statsApiClient } from './stats-api';

// Combined API object for convenience
export const api = {
  auth: authApiClient,
  barbers: barbersApiClient,
  services: servicesApiClient,
  timeSlots: timeSlotsApiClient,
  reservations: reservationsApiClient,
  stats: statsApiClient,
};
