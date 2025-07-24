const jwt = require('jsonwebtoken');

/**
 * Middleware to check if user has required role(s) from JWT token
 * @param {...string} allowedRoles - Roles that are permitted to access the route
 * @returns {Function} Express middleware function
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if authorization header exists
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
      }

      // Extract token from header
      const token = authHeader.split(' ')[1];
      
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user has roles in token
      if (!decoded.role) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token structure' });
      }
      

      // Convert role to array if it's a single string (for consistency)
      const userRoles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
      
      // Check if user has any of the allowed roles
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
      
      if (hasPermission) {
        // Attach user payload to request for use in subsequent middleware
        req.user = decoded;
        next(); // User has required role, proceed to route handler
      } else {
        res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
      }
    } catch (error) {
      // Handle different JWT errors specifically
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized - Token expired' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }
      // For other unexpected errors
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };
};

// Export the middleware
module.exports = checkRole;