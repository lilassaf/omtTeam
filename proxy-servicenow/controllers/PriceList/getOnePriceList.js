<<<<<<< HEAD
const priceList = require("../../models/priceList");
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

        const data = await priceList.findById(id);

        if (!data) return res.status(404).send({ message: 'Price List not found' });
        res.send(data);
    } catch (error) {
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
=======

const PriceList = require('../../models/priceList');
const getProductOfferingPriceByPriceList = require('../ProductOfferingPrice/getProductOfferingPriceByPriceList_includePO');
const Account = require('../../models/account')
module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const mongoDoc = await PriceList.findById(id).lean();
    const pop = await getProductOfferingPriceByPriceList(req);
    const account = await Account.findOne({'sys_id': mongoDoc.account});
    return res.status(200).json({...mongoDoc, pops: pop.result});

  } catch (error) {
    console.error('Error fetching price Lists:', error);
    const mongoError = handleMongoError(error);
    return res.status(mongoError.status).json({ error: mongoError.message });
  }
>>>>>>> f51a9c582772a7a89a4b8d2dd5ecee26195e2add
};