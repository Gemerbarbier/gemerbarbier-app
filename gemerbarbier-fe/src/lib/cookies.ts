/**
 * Cookie utility functions for managing browser cookies
 */

export interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;
}

/**
 * Set a cookie with the given name, value, and options
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  const {
    expires,
    path = '/',
    domain,
    secure = window.location.protocol === 'https:',
    sameSite = 'Lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    let expiresDate: Date;
    if (typeof expires === 'number') {
      expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + expires * 24 * 60 * 60 * 1000);
    } else {
      expiresDate = expires;
    }
    cookieString += `; expires=${expiresDate.toUTCString()}`;
  }

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
};

/**
 * Check if a cookie exists
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Get all cookies as an object
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  
  if (!document.cookie) return cookies;

  document.cookie.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
};

// Cookie names used in the application
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'gemerbarbier_auth_token',
  USER_PREFERENCES: 'gemerbarbier_preferences',
  ADMIN_SESSION: 'gemerbarbier_admin_session',
  SELECTED_BARBER: 'gemerbarbier_selected_barber',
  LANGUAGE: 'gemerbarbier_lang',
  COOKIE_CONSENT: 'gemerbarbier_cookie_consent',
} as const;
