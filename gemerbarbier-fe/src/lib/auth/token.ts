/**
 * JWT Token utilities for Spring Boot Security compatibility
 */

import { setCookie, getCookie, deleteCookie, COOKIE_KEYS } from '@/lib/cookies';
import type { JwtPayload } from './types';

// Token storage keys
const ACCESS_TOKEN_KEY = COOKIE_KEYS.AUTH_TOKEN;
const REFRESH_TOKEN_KEY = 'gemerbarbier_refresh_token';

/**
 * Decode a JWT token without verification
 * (Verification happens on the server)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = bufferSeconds * 1000;

  return currentTime >= expirationTime - bufferTime;
}

/**
 * Get time until token expires (in seconds)
 */
export function getTokenExpiresIn(token: string): number {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const remaining = Math.floor((expirationTime - currentTime) / 1000);

  return Math.max(0, remaining);
}

/**
 * Store access token securely
 */
export function setAccessToken(token: string, expiresIn?: number): void {
  const expires = expiresIn ? expiresIn / (24 * 60 * 60) : 1; // Convert seconds to days, default 1 day
  setCookie(ACCESS_TOKEN_KEY, token, {
    expires,
    secure: true,
    sameSite: 'Strict',
  });
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  const token = getCookie(ACCESS_TOKEN_KEY);
  if (!token) return null;

  // Check if token is expired
  if (isTokenExpired(token)) {
    deleteAccessToken();
    return null;
  }

  return token;
}

/**
 * Delete access token
 */
export function deleteAccessToken(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
}

/**
 * Store refresh token securely
 */
export function setRefreshToken(token: string): void {
  setCookie(REFRESH_TOKEN_KEY, token, {
    expires: 30, // 30 days
    secure: true,
    sameSite: 'Strict',
  });
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

/**
 * Delete refresh token
 */
export function deleteRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY);
}

/**
 * Clear all auth tokens
 */
export function clearAllTokens(): void {
  deleteAccessToken();
  deleteRefreshToken();
}

/**
 * Get Authorization header value
 */
export function getAuthHeader(): string | null {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
}

/**
 * Extract user info from token
 */
export function getUserFromToken(token: string): {
  id: string;
  username: string;
  email?: string;
  name?: string;
} | null {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    username: payload.sub,
    email: payload.email,
    name: payload.name,
  };
}
