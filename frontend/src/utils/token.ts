/**
 * Token management utility for authentication
 * This handles JWT tokens stored in localStorage for session management
 */

const TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'adminToken';
const AUTH_TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export const tokenUtils = {
  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || 
           localStorage.getItem(AUTH_TOKEN_KEY) || 
           localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  // Set authentication token
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Set admin token (for admin users)
  setAdminToken(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  // Remove all tokens
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Get stored user data (for session restoration only)
  getStoredUser(): any | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Store user data (for session restoration only)
  setStoredUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get admin token specifically
  getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Clear admin token specifically
  clearAdminToken(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};
