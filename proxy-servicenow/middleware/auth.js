// middleware/verifySession.js
const sessionStore = require('../utils/sessionStore');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
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