const axios = require('axios');
const ProductOffering = require('../../models/ProductOffering');
const handleMongoError = require('../../utils/handleMongoError');
const snConnection = require('../../utils/servicenowConnection');

module.exports = async (req, res) => {
  try {
          
          const connection = snConnection.getConnection(req.session.snAccessToken);
          const {id} = req.params;
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
  
          if (!productOffering.id && !productOffering.sys_id) {
              return res.status(400).json({ error: 'productOffering not synced with ServiceNow (missing sys_id)' });
          }
          const sys_id = productOffering.id || productOffering.sys_id;
          const snResponse = await axios.delete(
              `${connection.baseURL}/api/sn_tmf_api/catalogmanagement/productOffering/${sys_id}`,
              {
                  headers: { 'Authorization': `Bearer ${req.session.snAccessToken}` },
                  params: { sysparm_suppress_auto_sys_field: true }
              }
          );
  
          try {
              await ProductOffering.findByIdAndDelete(id);
          } catch (mongoError) {
              return handleMongoError(res, snResponse.data, mongoError, 'deletion');
          }
  
          res.status(204).end();
      } catch (error) {
          if (axios.isAxiosError(error)) {
              const status = error.response?.status || 500;
              return res.status(status).json({
                  error: status === 404 ? 'Not found' : 'ServiceNow delete failed',
                  details: error.response?.data || error.message
              });
          }
          res.status(500).json({ error: 'Server error', details: error.message });
      }
};