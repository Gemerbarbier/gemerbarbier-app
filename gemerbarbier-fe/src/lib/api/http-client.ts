/**
 * HTTP Client - Base utilities for API calls
 * Compatible with OpenAPI generated client style
 */

import { getAuthHeader } from '@/lib/auth';

// Configuration
export interface ApiConfiguration {
  basePath: string;
  headers?: Record<string, string>;
}

// Default configuration
const defaultConfig: ApiConfiguration = {
  basePath: import.meta.env.VITE_API_BASE_URL || '/gemerbarbier',
};

let globalConfig: ApiConfiguration = { ...defaultConfig };

/**
 * Set global API configuration
 */
export function setApiConfiguration(config: Partial<ApiConfiguration>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get current API configuration
 */
export function getApiConfiguration(): ApiConfiguration {
  return globalConfig;
}

// Response types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Generic error handler
 */
function handleError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'Neznáma chyba' };
}

/**
 * HTTP Client for making authenticated requests
 */
export async function httpClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...globalConfig.headers,
      ...options.headers,
    };

    // Add Authorization header if available
    const authHeader = getAuthHeader();
    if (authHeader) {
      (headers as Record<string, string>)['Authorization'] = authHeader;
    }

    const response = await fetch(`${globalConfig.basePath}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle no content
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
          message: errorData?.message || errorData?.error || 'Chyba servera',
          code: response.status.toString(),
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
      error: handleError(err),
      success: false,
    };
  }
}

/**
 * Build query string from params
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
