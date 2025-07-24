const axios = require('axios');
const Quote = require('../../models/quote');
const QuoteLine = require('../../models/quoteLine');
const deleteContractById = require('../../controllers/Contract/delete');
const handleMongoError = require('../../utils/handleMongoError');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the quote with associated sys_id
    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (!quote.sys_id) {
      return res.status(400).json({ error: 'Quote missing ServiceNow reference' });
    }

    // Delete from ServiceNow first
    const snResponse = await axios.delete(
      `${process.env.SERVICE_NOW_URL}/api/now/table/sn_quote_mgmt_core_quote/${quote.sys_id}`,
      {
        headers: {
          'Authorization': `Bearer ${req.session.snAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Verify ServiceNow deletion was successful
    if (snResponse.status < 200 || snResponse.status >= 300) {
      return res.status(502).json({
        error: 'ServiceNow deletion failed',
        details: snResponse.data
      });
    }

    // Delete associated contracts
    if (quote.contracts && quote.contracts.length > 0) {
      const contractDeletionPromises = quote.contracts.map(contract => 
        deleteContractById(contract._id)
      );
      
      await Promise.all(contractDeletionPromises);
    }

    // Delete associated quote lines
    const linesDeleteResult = await QuoteLine.deleteMany(
      { quote: id },
    );

    // Delete main quote document
    const quoteDeleteResult = await Quote.findByIdAndDelete(
      id,
    );

    if (!quoteDeleteResult) {
      return res.status(404).json({ error: 'Quote not found during deletion' });
    }

    res.status(200).json({
      message: 'Quote and associated data deleted successfully from both systems',
      serviceNowId: quote.sys_id,
      localId: id,
      deletedLines: linesDeleteResult.deletedCount,
      deletedContracts: quote.contracts?.length || 0
    });

  } catch (error) { 
    // Handle ServiceNow API errors
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        error: 'ServiceNow integration failed',
        details: error.response?.data || error.message
      });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // Handle other errors
    handleMongoError(error, res);
  } 
};