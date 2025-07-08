// middleware/verifySession.js
const sessionStore = require('../utils/sessionStore');

const verifySession = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.session_id;
    if (!sessionId) throw new Error('Missing session cookie');

    const session = sessionStore.getSession(sessionId);
    if (!session) {
      res.clearCookie('session_id');
      throw new Error('Invalid session');
    }

    // Attach the entire session to req.session
    req.session = session;
    next();
  } catch (error) {
    console.error('Session verification failed:', error.message);
    res.status(401).clearCookie('session_id').json({ 
      error: 'session_expired',
      message: 'Please login again' 
    });
  }
};

module.exports = verifySession;