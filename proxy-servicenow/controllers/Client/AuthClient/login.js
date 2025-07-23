const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Contact = require('../../../models/Contact'); // Your Mongoose contact model
require('dotenv').config();

const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Both email and password are required',
  INVALID_CREDENTIALS: 'Incorrect email or password',
  AUTH_FAILED: 'Unable to authenticate'
};

async function Login(req, res) {
  
  const { email = '', password = '' } = req.body;

  if (!email.trim() || !password.trim()) {
    return res.status(400).json({
      error: 'missing_fields',
      error_description: ERROR_MESSAGES.MISSING_FIELDS
    });
  }

  try {
    // 🔍 1. Check if user exists in MongoDB
    const contact = await Contact.findOne({ email: email.trim() });
    if (!contact) {
      return res.status(401).json({
        error: 'invalid_credentials',
        error_description: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // 🔐 2. Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, contact.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'invalid_credentials',
        error_description: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // 🔑 3. Get ServiceNow token using admin credentials
    const authData = new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      username: process.env.SERVICE_NOW_USER,
      password: process.env.SERVICE_NOW_PASSWORD
    });

    const { data } = await axios.post(
      `${process.env.SERVICE_NOW_URL}/oauth_token.do`,
      authData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        timeout: 10000,
        validateStatus: status => status < 500
      }
    );

    if (!data?.access_token) {
      return res.status(401).json({
        error: 'invalid_credentials',
        error_description: data?.error_description || ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // 🛡️ 4. Create JWT with role
    const payload = {
      sub: email,
      sn_access_token: data.access_token,
      scope: data.scope,
      iss: process.env.JWT_ISSUER || 'your-app',
      iat: Math.floor(Date.now() / 1000),
      role: contact.isPrimaryContact ? 'primaryContact' : 'contact'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '8h'
    });

    // 🍪 5. Send secure cookie
    res.cookie('id_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 8
    });

    res.set({
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }).json({
      id_token: token,
      token_type: 'Bearer',
      expires_in: data.expires_in,
      scope: data.scope,
      issued_at: new Date().toISOString(),
      role: contact.isPrimaryContact ? 'primaryContact' : 'contact',
      email: contact.email,
      id: contact._id
    });

  } catch (err) {
    const status = err.response?.status || 503;
    const errorResponse = err.response?.data;

    console.error('Token error:', err.message);
    if (errorResponse) {
      console.error('Response data:', JSON.stringify(errorResponse));
    }

    res.status(status).json({
      error: errorResponse?.error || 'authentication_failed',
      error_description: errorResponse?.error_description || ERROR_MESSAGES.AUTH_FAILED
    });
}
  
}

module.exports = Login;
