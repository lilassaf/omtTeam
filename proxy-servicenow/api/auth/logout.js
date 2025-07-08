const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const sessionStore = require('../../utils/sessionStore'); // ✅ Correct import

const router = express.Router();

const ERROR_MESSAGES = {
  LOGOUT_FAILED: 'Logout failed due to server error',
  PARTIAL_LOGOUT: 'Logged out but token revocation failed',
  NO_SESSION: 'No active session found'
};

/**
 * Secure cookie options (matches login configuration)
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined
});

/**
 * Revoke ServiceNow token with 1 retry if needed
 */
const revokeServiceNowToken = async (token, attempt = 1) => {
  try {
    const response = await axios.post(
      `${process.env.SERVICE_NOW_URL}/oauth_revoke_token.do`,
      new URLSearchParams({
        token,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 5000
      }
    );
    return response.status === 200;
  } catch (err) {
    console.error(`Token revocation failed (attempt ${attempt}):`, err.message);
    if (attempt < 2 && (!err.response || err.code === 'ECONNABORTED')) {
      return revokeServiceNowToken(token, attempt + 1);
    }
    return false;
  }
};

/**
 * Logout endpoint
 */
router.post('/logout', async (req, res) => {
  const transactionId = uuidv4();
  console.log(`[${transactionId}] Starting logout process`);

  try {
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      console.log(`[${transactionId}] No session found`);
      return res.status(200).json({
        success: true,
        message: ERROR_MESSAGES.NO_SESSION
      });
    }

    const session = sessionStore.getSession(sessionId);
    let tokenRevocationSuccess = true;

    if (session?.snAccessToken) {
      tokenRevocationSuccess = await revokeServiceNowToken(session.snAccessToken);
      sessionStore.deleteSession(sessionId);
      console.log(`[${transactionId}] Session ${sessionId.substring(0, 8)}... deleted`);
    }

    res.clearCookie('session_id', {
      ...getCookieOptions(),
      expires: new Date(0)
    });

    if (tokenRevocationSuccess) {
      console.log(`[${transactionId}] Logout completed successfully`);
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } else {
      console.warn(`[${transactionId}] Logout completed with warning: token revocation failed`);
      return res.status(200).json({
        success: true,
        message: ERROR_MESSAGES.PARTIAL_LOGOUT,
        warning: 'ServiceNow token revocation failed'
      });
    }

  } catch (error) {
    console.error(`[${transactionId}] Critical logout error:`, error.message);

    res.clearCookie('session_id', getCookieOptions())
      .status(500)
      .json({
        error: 'logout_failed',
        error_description: ERROR_MESSAGES.LOGOUT_FAILED,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          errorId: transactionId
        })
      });
  }
});

module.exports = router;
