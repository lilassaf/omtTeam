const Location = require('../../models/location');
const { isValidObjectId } = require('mongoose');
const handleMongoError = require('../../utils/handleMongoError');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid ID format',
        message: 'Please provide a valid MongoDB ObjectID'
      });
    }

    // Find account in MongoDB with populated data
    const location = await Location.findById(id)
      .populate({
        path: 'account',
        select: 'name email phone status sys_id'
      })
      .populate({
        path: 'contact',
        select: 'firstName lastName email phone jobTitle isPrimaryContact active sys_id',
        options: { sort: { isPrimaryContact: -1, lastName: 1 } } // Primary contacts first
      })
      .lean(); // Convert to plain JavaScript object

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'location not found',
        message: `No location found with ID ${id} in MongoDB`
      });
    }

    return res.json({
      success: true,
      data: location
    });

  } catch (error) {
    console.error('Error in getlocationById:', error);
    
    // Handle MongoDB-specific errors
    if (error.name === 'CastError' || error.name.includes('Mongo')) {
      const mongoError = handleMongoError(error);
      return res.status(mongoError.status).json({ 
        success: false,
        error: mongoError.message,
        details: mongoError.details 
      });
    }
    
    // Handle other unexpected errors
    return res.status(500).json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
};