const Contact = require('../../models/Contact');
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
    const contact = await Contact.findById(id)
      .populate({
        path: 'account',
        select: 'name email phone status sys_id'
      })
      .populate({
        path: 'location',
        select: 'name city state country street zip latitude longitude sys_id'
      })
      .lean(); // Convert to plain JavaScript object

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
        message: `No contact found with ID ${id} in MongoDB`
      });
    }

    return res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error in getContactById:', error);
    
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