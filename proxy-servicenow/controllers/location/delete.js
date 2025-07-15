const config = require('../../utils/configCreateAccount');
const axios = require('axios');
const Location = require('../../models/location');
const handleMongoError = require('../../utils/handleMongoError');
const snConnection = require('../../utils/servicenowConnection');

async function deleteLocation(req, res) {
  try {
    const locationId = req.params.id;
    const location = await Location.findById(locationId);

    if (!location) {
      return res.status(404).json({ error: 'Location not found in MongoDB' });
    }

    // Delete from ServiceNow if sys_id exists
    if (location.sys_id) {
      try {
        if (!req.user?.sn_access_token) {
          return res.status(401).json({ error: 'Missing ServiceNow access token' });
        }

        const connection = snConnection.getConnection(req.user.sn_access_token);

        // 1. Get all account_address_relationships related to this location
        const relationships = await axios.get(
          `${connection.baseURL}/api/now/table/account_address_relationship?sysparm_query=location=${location.sys_id}`,
          { headers: connection.headers }
        );

        // 2. Delete each relationship one by one
        for (const rel of relationships.data.result) {
          await axios.delete(
            `${connection.baseURL}/api/now/table/account_address_relationship/${rel.sys_id}`,
            { headers: connection.headers }
          );
        }

        // 3. Delete the location itself
        await axios.delete(
          `${connection.baseURL}/api/now/table/cmn_location/${location.sys_id}`,
          { headers: connection.headers }
        );

        console.log(`Deleted location ${location.sys_id} from ServiceNow`);
      } catch (error) {
        console.error('ServiceNow deletion error:', error.message);
        // Continue with MongoDB deletion even if ServiceNow fails
      }
    }

    // Delete from MongoDB
    await Location.findByIdAndDelete(locationId);
    console.log(`Deleted location ${locationId} from MongoDB`);

    return res.json({
      message: 'Location deleted successfully',
      deletedLocationId: locationId,
      serviceNowDeleted: !!location.sys_id
    });

  } catch (error) {
    console.error('Error deleting location:', error);

    if (error.name?.includes('Mongo')) {
      const mongoError = handleMongoError(error);
      return res.status(mongoError.status).json({ error: mongoError.message });
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    return res.status(status).json({ error: message });
  }
}

module.exports = deleteLocation;
