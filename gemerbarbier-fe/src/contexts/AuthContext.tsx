/**
 * Authentication Context for React
 * Simple admin-only login for dashboard access
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api/auth-api';
import {
  setAccessToken,
  setRefreshToken,
  clearAllTokens,
  getAccessToken,
  isTokenExpired,
  getUserFromToken,
  type AuthContextType,
  type AuthState,
  type LoginRequest,
  type UserInfo,
} from '@/lib/auth';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { toast } = useToast();

  // Update state helper
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(
    (accessToken: string, refreshToken?: string, user?: UserInfo) => {
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      const userInfo = user || getUserFromToken(accessToken);

      updateState({
        isAuthenticated: true,
        isLoading: false,
        accessToken,
        user: userInfo
          ? {
              id: userInfo.id,
              username: userInfo.username,
              email: userInfo.email,
              name: userInfo.name,
            }
          : null,
        error: null,
      });
    },
    [updateState]
  );

  // Login
  const login = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      updateState({ isLoading: true, error: null });

      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        handleAuthSuccess(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );

        toast({
          title: 'Úspešné prihlásenie',
          description: 'Vitajte späť!',
        });

        return true;
      }

      updateState({
        isLoading: false,
        error: response.error?.message || 'Prihlásenie zlyhalo',
      });

      toast({
        title: 'Chyba prihlásenia',
        description: response.error?.message || 'Neplatné prihlasovacie údaje',
        variant: 'destructive',
      });

      return false;
    },
    [handleAuthSuccess, toast, updateState]
  );

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    updateState({ isLoading: true });

    await authApi.logout();

    clearAllTokens();
    updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      error: null,
    });

    toast({
      title: 'Odhlásenie',
      description: 'Boli ste úspešne odhlásený.',
    });
  }, [toast, updateState]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const response = await authApi.refreshToken();

    if (response.success && response.data) {
      handleAuthSuccess(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user
      );
      return true;
    }

    clearAllTokens();
    updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      error: null,
    });

    return false;
  }, [handleAuthSuccess, updateState]);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      updateState({ isLoading: false, isAuthenticated: false });
      return false;
    }

    if (isTokenExpired(token)) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        updateState({ isLoading: false, isAuthenticated: false });
        return false;
      }
      return true;
    }

    const userInfo = getUserFromToken(token);
    updateState({
      isAuthenticated: true,
      isLoading: false,
      accessToken: token,
      user: userInfo
        ? {
            id: userInfo.id,
            username: userInfo.username,
            email: userInfo.email,
            name: userInfo.name,
          }
        : null,
    });

    return true;
  }, [refreshToken, updateState]);

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auto-refresh token before expiration, or force logout if refresh fails
  useEffect(() => {
    if (!state.accessToken || !state.isAuthenticated) return;

    const checkAndRefresh = async () => {
      if (state.accessToken && isTokenExpired(state.accessToken, 300)) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          // Token expired and refresh failed — force logout
          clearAllTokens();
          sessionStorage.clear();
          updateState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            accessToken: null,
            error: null,
          });
          toast({
            title: 'Relácia vypršala',
            description: 'Boli ste automaticky odhlásený. Prihláste sa znova.',
            variant: 'destructive',
          });
          window.location.href = '/admin-dashboard/login';
        }
      }
    };

    // Check immediately on mount
    checkAndRefresh();

    const interval = setInterval(checkAndRefresh, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [state.accessToken, state.isAuthenticated, refreshToken, toast, updateState]);

  // Context value (no register)
  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      logout,
      refreshToken,
      checkAuth,
      clearError,
    }),
    [state, login, logout, refreshToken, checkAuth, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
