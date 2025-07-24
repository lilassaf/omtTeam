// utils/sessionStore.js
const { v4: uuidv4 } = require('uuid');

class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  createSession(sessionData) {
    const sessionId = uuidv4();
    this.sessions.set(sessionId, {
      ...sessionData,
      createdAt: new Date(),
      lastAccessed: new Date()
    });
    return sessionId;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessed = new Date();
    }
    return session;
  }

  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  cleanupExpiredSessions(timeout = 8 * 60 * 60 * 1000) {
    const now = new Date();
    let cleanedCount = 0;
    
    this.sessions.forEach((session, sessionId) => {
      if (now - session.lastAccessed > timeout) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
    return cleanedCount;
  }

  // For testing/debugging purposes
  getAllSessions() {
    return Array.from(this.sessions.entries());
  }
}

// Singleton instance
const sessionStore = new SessionStore();

// Start cleanup interval (matches your existing 1-hour interval)
setInterval(() => {
  sessionStore.cleanupExpiredSessions();
}, 60 * 60 * 1000);

module.exports = sessionStore;