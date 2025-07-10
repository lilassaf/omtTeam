const axios = require('axios');
const snConnection = require('../../utils/servicenowConnection');
const handleMongoError = require('../../utils/handleMongoError');
const priceList = require('../../models/priceList');
const mongoose = require('mongoose');

async function createPriceList(req, res = null) {
  try {

    const newId = new mongoose.Types.ObjectId();

    const payload = {
      ...req.body,
      external_id: newId
    }

    // Create in ServiceNow
    const connection = snConnection.getConnection(req.session.snAccessToken);
    const snResponse = await axios.post(
      `${connection.baseURL}/api/now/table/sn_csm_pricing_price_list`,
      payload,
      { headers: connection.headers }
    );

    //payload mongodb 
    const payloadDB = {
      _id: newId,
      ...snResponse.data.result,
    }

    try {
      const priceDoc = new priceList(payloadDB);
      await priceDoc.save();

      // Prepare response with both ServiceNow and MongoDB IDs
      const response = {
        ...snResponse.data.result,
        _id: newId, // Include MongoDB ID in the response
        mongoId: newId // Alternative field name if preferred
      };

      if (res) {
        return res.status(201).json(response);
      }
      return response;

    } catch (mongoError) {
      if (res) {
        return handleMongoError(res, snResponse.data.result, mongoError, 'creation');
      }
      throw mongoError;
    }



  } catch (error) {
    console.error('Error creating price list:', error);
    if (res) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;
      return res.status(status).json({ error: message });
    }
    throw error;
  }
}

// Original Express route handler for backward compatibility
module.exports = async (req, res) => {
  return createPriceList(req, res);
};

// Export the function directly as well
module.exports.createPriceList = createPriceList;