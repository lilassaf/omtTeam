const axios = require('axios');
const ProductOffering = require('../../models/ProductOffering');
const handleMongoError = require('../../utils/handleMongoError');
const snConnection = require('../../utils/servicenowConnection');

module.exports = async (req, res)=>{
  
    try{
      const id = req.body.id;
      const connection = snConnection.getConnection(req.session.snAccessToken);

      // Find the productOffering by MongoDB _id to get ServiceNow sys_id
      let productOffering;
      try {
          productOffering = await ProductOffering.findById(id);
      } catch (error) {
          if (error.name === 'CastError') {
              return res.status(400).json({ error: 'Invalid productOffering ID format' });
          }
          throw error;
      }

      if (!productOffering) {
          return res.status(404).json({ error: 'productOffering not found' });
      }

      if (!productOffering.id) {
          return res.status(400).json({ error: 'productOffering not synced with ServiceNow (missing sys_id)' });
      }

      const sys_id = productOffering.id || productOffering.sys_id;
  
      // Validate allowed fields
      const allowedFields = ['id', 'status'];
      
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every(update => allowedFields.includes(update));
  
      if (!isValidOperation) {
        return res.status(400).json({ error: 'Only two fields allowed: id & status!' });
      }
     
      const payload = {"sys_id":sys_id, "status":req.body.status};
      const snResponse = await axios.patch(
        `${connection.baseURL}/api/x_1598581_omt_dx_0/product_management_api/po_pub`,
        payload,
        {
          headers: connection.headers
        }
      );
      try {
          await ProductOffering.findByIdAndUpdate(
              id,
              { $set:{ 
                lifecycleStatus: snResponse.data.lifecycleStatus,
                status: snResponse.data.status 
              }},
              { runValidators: true }
          );
      } catch (mongoError) {
          return handleMongoError(res, snResponse.data, mongoError, 'update');
      }
  
      res.json({"_id":id, ...snResponse.data});
      
    } catch (error) {
      console.error('Error update product offering\'s state: ', error);
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;
      res.status(status).json({ error: message });
    }
  }