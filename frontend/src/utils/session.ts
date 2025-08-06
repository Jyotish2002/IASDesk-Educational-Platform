/**
 * Session Management Utility
 * Prevents multiple user sessions in the same browser
 */

const SESSION_KEY = 'activeSession';
const USER_SESSION_KEY = 'userSessionId';

export const sessionUtils = {
  // Generate unique session ID
  generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Set active session for current user
  setActiveSession(userId: string): string {
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId,
      sessionId,
      timestamp: Date.now(),
      tabId: sessionId
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(USER_SESSION_KEY, sessionId);
    
    return sessionId;
  },

  // Check if current session is active
  isSessionActive(userId: string, currentSessionId: string): boolean {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (!storedSession) return false;

      const sessionData = JSON.parse(storedSession);
      
      // Check if same user and same session
      return sessionData.userId === userId && sessionData.sessionId === currentSessionId;
    } catch {
      return false;
    }
  },

  // Get current session ID
  getCurrentSessionId(): string | null {
    return localStorage.getItem(USER_SESSION_KEY);
  },

  // Clear session data
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_SESSION_KEY);
  },

  // Handle session conflict (different user trying to login)
  handleSessionConflict(newUserId: string): boolean {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (!storedSession) return true; // No existing session

      const sessionData = JSON.parse(storedSession);
      
      // If different user, clear old session
      if (sessionData.userId !== newUserId) {
        this.clearSession();
        return true;
      }
      
      return false; // Same user, no conflict
    } catch {
      this.clearSession();
      return true;
    }
  }
};
