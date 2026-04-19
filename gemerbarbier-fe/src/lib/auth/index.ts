/**
 * Authentication module - Centralized exports
 * Simple admin-only login (no roles, no registration)
 */

// Types
export type {
  JwtPayload,
  LoginRequest,
  AuthResponse,
  UserInfo,
  AuthState,
  AuthContextType,
} from './types';

// Token utilities
export {
  decodeToken,
  isTokenExpired,
  getTokenExpiresIn,
  setAccessToken,
  getAccessToken,
  deleteAccessToken,
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  clearAllTokens,
  getAuthHeader,
  getUserFromToken,
} from './token';

// Auth API
export { authApi } from '@/lib/api/auth-api';
