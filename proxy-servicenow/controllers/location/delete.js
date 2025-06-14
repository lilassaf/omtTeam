const Location = require('../../models/location');
const axios = require('axios');
const snConnection = require('../../utils/servicenowConnection');
const handleMongoError = require('../../utils/handleMongoError');

module.exports = async (req, res) => {
    try {
      const mongoId = req.params.id; // MongoDB _id
      
      // First, find the location in MongoDB to get the ServiceNow sys_id
      const location = await Location.findById(mongoId);
      
      if (!location) {
        return res.status(404).json({ error: 'location not found in MongoDB' });
      }
      
      const servicenowId = location.sys_id;
      
      console.log(`Deleting location - MongoDB ID: ${mongoId}, ServiceNow ID: ${servicenowId}`);
      
      // Step 1: Delete from MongoDB first
      await location.findByIdAndDelete(mongoId);
      console.log(`location deleted from MongoDB: ${mongoId}`);
      
      // Step 2: Delete from ServiceNow if sys_id exists
      if (servicenowId) {
        try {
          const connection = snConnection.getConnection(req.user.sn_access_token);
          const snResponse = await axios.delete(
            `${connection.baseURL}/api/now/table/cmn_location/${servicenowId}`, // Adjust table name as needed
            { headers: connection.headers }
          );
          console.log(`location deleted from ServiceNow: ${servicenowId}`);
          
          res.json({
            message: 'location successfully deleted from both MongoDB and ServiceNow',
            mongoId: mongoId,
            servicenowId: servicenowId,
            servicenowResponse: snResponse.data
          });
        } catch (snError) {
          // MongoDB deletion succeeded but ServiceNow failed
          console.error('ServiceNow deletion failed:', snError);
          res.status(207).json({ // 207 Multi-Status
            message: 'location deleted from MongoDB but ServiceNow deletion failed',
            mongoId: mongoId,
            servicenowId: servicenowId,
            error: snError.response?.data?.error?.message || snError.message
          });
        }
      } else {
        // No ServiceNow ID, only MongoDB deletion
        res.json({
          message: 'location successfully deleted from MongoDB (no ServiceNow ID found)',
          mongoId: mongoId
        });
      }
      
    } catch (error) {
      console.error('Error deleting location:', error);
      
      // Handle invalid MongoDB ObjectId
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          error: 'Invalid MongoDB ID format',
          mongoId: req.params.id
        });
      }
      
      // Handle MongoDB errors
      if (error.name && error.name.includes('Mongo')) {
        const mongoError = handleMongoError(error);
        return res.status(mongoError.status).json({ error: mongoError.message });
      }
      
      // Handle other errors
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;
      res.status(status).json({ error: message });
    }
  };