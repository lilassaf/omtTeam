const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const snConnection = require('../../utils/servicenowConnection');

const router = express.Router();
require('dotenv').config();

router.get('/measurment-unit', async (req, res) => {
    try {

      // Verify JWT
      const connection = snConnection.getConnection(req.session.snAccessToken);
  
      // ServiceNow configuration
      const serviceNowUrl = `${connection.baseURL}/api/now/table/sn_prd_pm_uom`;
      const serviceNowHeaders = connection.headers;
  
      // ServiceNow API call with query parameters
      const response = await axios.get(serviceNowUrl, {
        headers: serviceNowHeaders,
        params: req.query // Forward client query parameters to ServiceNow
      });
  
      // Forward successful response
      res.status(response.status).json(response.data.result);
  
    } catch (error) {
      console.error('ServiceNow API error:', error);
  
      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        return res.status(error.response?.status || 500).json({
          error: 'ServiceNow API request failed',
          details: error.response?.data || error.message
        });
      }
  
      // Handle other errors
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
});

module.exports = router;