const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();


const router = express.Router();
router.use(cookieParser());
// Import session store
const sessionStore = require('../..//utils/sessionStore');

const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Both username and password are required',
  INVALID_CREDENTIALS: 'Incorrect username or password',
  AUTH_FAILED: 'Unable to authenticate',
  SESSION_EXPIRED: 'Session expired or invalid',
  FORBIDDEN: 'Insufficient permissions',
  RATE_LIMITED: 'Too many requests, please try again later',
  LOGOUT_FAILED: 'Logout failed due to server error',
  PARTIAL_LOGOUT: 'Logged out but token revocation failed'
};

// Security middleware
router.use(helmet());
router.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

const sanitizeUserData = (user) => {
  const { password, salt, __v, _id, ...safeData } = user;
  return {
    ...safeData,
    id: user._id || user.sys_id
  };
};

// Verify session middleware
const verifySession = async (req, res, next) => {
  try {
    const sessionId = req.cookies.session_id;
    if (!sessionId) throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);

    const session = sessionStore.getSession(sessionId);
    if (!session) throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);

    try {
      await axios.get(`${process.env.SERVICE_NOW_URL}/api/now/table/sys_user/${session.userData.sys_id}`, {
        headers: {
          Authorization: `Bearer ${session.snAccessToken}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 5000
      });
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const refreshResponse = await axios.post(
            `${process.env.SERVICE_NOW_URL}/oauth_token.do`,
            new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
              refresh_token: session.refreshToken
            }),
            { 
              headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
              },
              timeout: 5000
            }
          );

          if (refreshResponse.data?.access_token) {
            session.snAccessToken = refreshResponse.data.access_token;
            session.refreshToken = refreshResponse.data.refresh_token;
            sessionStore.updateSession(sessionId, session);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          sessionStore.deleteSession(sessionId);
          throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
        }
      } else {
        throw err;
      }
    }

    req.session = session;
    next();
  } catch (err) {
    console.error('Session verification failed:', err.message);
    res.status(401).clearCookie('session_id').json({ 
      error: 'invalid_session',
      error_description: ERROR_MESSAGES.SESSION_EXPIRED
    });
  }
};

// Login endpoint
// Login endpoint
router.post('/login', async (req, res) => {
  const { username = '', password = '' } = req.body;

  if (!username.trim() || !password.trim()) {
    return res.status(400).json({
      error: 'missing_fields',
      error_description: ERROR_MESSAGES.MISSING_FIELDS
    });
  }

  try {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    let userAccessToken;
    let userRefreshToken;
    let usingAdminToken = false;
    let adminTokenResponse;

    // STEP 1: First try to authenticate with user's credentials
    try {
      const userAuthData = new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        username: trimmedUsername,
        password: trimmedPassword
      });

      const userTokenResponse = await axios.post(
        `${process.env.SERVICE_NOW_URL}/oauth_token.do`,
        userAuthData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 5000
        }
      );

      userAccessToken = userTokenResponse.data.access_token;
      userRefreshToken = userTokenResponse.data.refresh_token;
    } catch (userAuthError) {
      // If authentication fails with 401, verify credentials using admin token
      if (userAuthError.response?.status === 401) {
        // Get admin token first
        const adminAuthData = new URLSearchParams({
          grant_type: 'password',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          username: process.env.SERVICE_NOW_USER,
          password: process.env.SERVICE_NOW_PASSWORD
        });

        adminTokenResponse = await axios.post(
          `${process.env.SERVICE_NOW_URL}/oauth_token.do`,
          adminAuthData,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 10000
          }
        );

        const adminToken = adminTokenResponse.data.access_token;

        // Verify user credentials using admin token
        try {
          // This API call will fail if credentials are invalid
          await axios.get(
            `${process.env.SERVICE_NOW_URL}/api/now/table/sys_user?sysparm_query=user_name=${encodeURIComponent(trimmedUsername)}&sysparm_fields=sys_id&sysparm_limit=1`,
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
                'Accept': 'application/json'
              },
              timeout: 5000
            }
          );

          // If we get here, credentials are valid but couldn't get user token
          // So we'll use admin token instead
          userAccessToken = adminTokenResponse.data.access_token;
          userRefreshToken = adminTokenResponse.data.refresh_token;
          usingAdminToken = true;
        } catch (verifyError) {
          // If verification fails, credentials are invalid
          return res.status(401).json({
            error: 'invalid_credentials',
            error_description: ERROR_MESSAGES.INVALID_CREDENTIALS
          });
        }
      } else {
        // Other errors (network, timeout, etc.)
        throw userAuthError;
      }
    }

    // STEP 2: Get full user info with the obtained token
    const { data: userResponse } = await axios.get(
      `${process.env.SERVICE_NOW_URL}/api/now/table/sys_user?sysparm_query=user_name=${encodeURIComponent(trimmedUsername)}&sysparm_limit=1`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!userResponse.result || userResponse.result.length === 0) {
      throw new Error('User not found in ServiceNow');
    }

    const userInfo = userResponse.result[0];

    // STEP 3: Get roles with the obtained token
    const { data: rolesResponse } = await axios.get(
      `${process.env.SERVICE_NOW_URL}/api/now/table/sys_user_has_role` +
        `?sysparm_query=user=${userInfo.sys_id}` +
        `&sysparm_fields=role` +
        `&sysparm_display_value=true`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          Accept: 'application/json'
        },
        timeout: 5000
      }
    );

    let simplifiedRole = 'guest';
    let contactInfo = null;
    let isPrimaryContact = false;

    const roles = rolesResponse.result?.map(r => r.role.display_value) || [];
    const hasAdminRole = roles.includes('admin');
    if (hasAdminRole) {
      simplifiedRole = 'admin';
    } else {
      try {
        const { data: contactResponse } = await axios.get(
          `${process.env.SERVICE_NOW_URL}/api/now/table/customer_contact` +
            `?sysparm_query=user=${userInfo.sys_id}` +
            `&sysparm_limit=1`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`,
              Accept: 'application/json'
            },
            timeout: 5000
          }
        );

        if (contactResponse.result?.length > 0) {
          contactInfo = contactResponse.result[0];
          isPrimaryContact = contactInfo.primary === 'true';
          simplifiedRole = isPrimaryContact ? 'primary_contact' : 'contact';
        }
      } catch (err) {
        console.error('Failed to fetch contact:', err.message);
      }
    }

    // STEP 4: Create session
    const sessionData = {
      username: trimmedUsername,
      snAccessToken: userAccessToken,
      refreshToken: userRefreshToken,
      userData: {
        ...sanitizeUserData(userInfo),
        role: simplifiedRole,
        contact: contactInfo,
        isPrimaryContact,
        authenticatedWithAdmin: usingAdminToken
      },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    const sessionId = sessionStore.createSession(sessionData);
    console.log(sessionStore.getSession(sessionId))

    // STEP 5: Set session cookie
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 8,
      path: '/'
    }).json({
      user: sessionData.userData
    });

  } catch (err) {
    console.error('Login error:', err.message);
    const status = err.response?.status || 401;
    const errorType = status === 401 ? 'invalid_credentials' : 'authentication_failed';
    const errorDesc =
      err.response?.data?.error_description ||
      ERROR_MESSAGES[errorType.toUpperCase()] ||
      ERROR_MESSAGES.AUTH_FAILED;

    res.status(status).json({
      error: errorType,
      error_description: errorDesc,
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
});

// Me endpoint
router.get('/me', verifySession, (req, res) => {
  try {
    res.json({ 
      user: req.session.userData,
      session: {
        createdAt: req.session.createdAt,
        lastAccessed: req.session.lastAccessed
      }
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Failed to retrieve user data'
    });
  }
});

module.exports = router;