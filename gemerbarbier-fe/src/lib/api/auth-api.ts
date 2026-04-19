/**
 * Authentication API Client
 * Endpoint: /api/auth
 *
 * Simple admin-only login for dashboard access
 */

import { getAuthHeader, getRefreshToken } from '@/lib/auth/token';

// ============= Configuration =============

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || '/auth';
const LOGIN_URL = import.meta.env.VITE_AUTH_API_URL + '/login';

// ============= Types =============

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user?: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ============= HTTP Client for Auth =============

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = AUTH_API_URL
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    const authHeader = getAuthHeader();
    if (authHeader) {
      (headers as Record<string, string>)['Authorization'] = authHeader;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 204) {
      return { data: null, error: null, success: true };
    }

    const contentType = response.headers.get('content-type');
    let data: T | null = null;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorData = data as unknown as {
        message?: string;
        error?: string;
        errors?: Record<string, string[]>;
      };

      return {
        data: null,
        error: {
          message: errorData?.message || errorData?.error || 'Chyba pri prihlásení',
          status: response.status,
          errors: errorData?.errors,
        },
        success: false,
      };
    }

    return { data, error: null, success: true };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : 'Sieťová chyba',
        status: 0,
      },
      success: false,
    };
  }
}

// ============= API Methods =============

/**
 * Login with username and password
 * POST /api/auth/login
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  return authFetch<AuthResponse>('', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, LOGIN_URL);
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refreshToken(): Promise<ApiResponse<AuthResponse>> {
  const token = getRefreshToken();
  if (!token) {
    return {
      data: null,
      error: { message: 'Žiadny refresh token', status: 401 },
      success: false,
    };
  }

  return authFetch<AuthResponse>('/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  });
}

/**
 * Logout - invalidate tokens on server
 * POST /api/auth/logout
 */
export async function logout(): Promise<ApiResponse<void>> {
  const token = getRefreshToken();
  return authFetch<void>('/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  });
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  return authFetch<UserInfo>('/me', {
    method: 'GET',
  });
}

/**
 * Validate current token
 * GET /api/auth/validate
 */
export async function validateToken(): Promise<
  ApiResponse<{ valid: boolean; user?: UserInfo }>
> {
  return authFetch<{ valid: boolean; user?: UserInfo }>('/validate', {
    method: 'GET',
  });
}

// ============= API Object Export =============

export const authApi = {
  login,
  refreshToken,
  logout,
  getCurrentUser,
  validateToken,
};
