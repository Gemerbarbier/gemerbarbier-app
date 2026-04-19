/**
 * Authentication types compatible with Spring Boot Security
 * Simple admin-only login (no roles, no registration)
 */

// JWT Token structure (decoded)
export interface JwtPayload {
  sub: string; // Subject (user ID or username)
  iat: number; // Issued at
  exp: number; // Expiration
  email?: string;
  name?: string;
  [key: string]: unknown;
}

// Login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Login response from Spring Boot
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user?: UserInfo;
}

// User info (simplified - no roles)
export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

// Auth state
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  error: string | null;
}

// Auth context actions
export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}
