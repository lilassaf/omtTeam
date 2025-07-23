const Quote = require('../../models/quote');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const contactId = req.params.id; // Contact ID from URL params 
    
    // Validate if contactId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID format' });
    }

    // Build aggregation pipeline to find quote by contact ID
    const pipeline = [
      // First, lookup the account that contains this contact
      {
        $lookup: {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'account_info',
          pipeline: [
            {
              $lookup: {
                from: 'contacts',
                localField: '_id',
                foreignField: 'account',
                as: 'contacts'
              }
            },
            // Filter accounts that have the specific contact
            {
              $match: {
                'contacts._id': new mongoose.Types.ObjectId(contactId)
              }
            }
          ]
        }
      },
      // Only keep quotes that have matching accounts (with the contact)
      {
        $match: {
          'account_info': { $ne: [] }
        }
      },
      // Now build the full quote details (same as your original pipeline)
      // Opportunity lookup with null preservation
      {
        $lookup: {
          from: 'opportunities',
          localField: 'opportunity',
          foreignField: '_id',
          as: 'opportunity'
        }
      },
      { $unwind: { path: '$opportunity', preserveNullAndEmptyArrays: true } },
      
      // Contracts lookup
      {
        $lookup: {
          from: 'contracts',
          localField: '_id',
          foreignField: 'quote',
          as: 'contracts'
        }
      },
      
      // Account lookup with nested population (full details)
      {
        $lookup: {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'account',
          pipeline: [
            {
              $lookup: {
                from: 'contacts',
                localField: '_id',
                foreignField: 'account',
                as: 'contacts'
              }
            },
            {
              $lookup: {
                from: 'locations',
                localField: '_id',
                foreignField: 'account',
                as: 'locations'
              }
            }
          ]
        }
      },
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },
      
      // Price list lookup
      {
        $lookup: {
          from: 'price_lists',
          localField: 'price_list',
          foreignField: '_id',
          as: 'price_list'
        }
      },
      { $unwind: { path: '$price_list', preserveNullAndEmptyArrays: true } },
      
      // Quote lines lookup with product offerings
      {
        $lookup: {
          from: 'quotelines',
          let: { quoteId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$quote', '$$quoteId'] } } },
            {
              $lookup: {
                from: 'productofferings',
                localField: 'product_offering',
                foreignField: '_id',
                as: 'product_offering'
              }
            },
            { $unwind: { path: '$product_offering', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'price_lists',
                localField: 'price_list',
                foreignField: '_id',
                as: 'price_list'
              }
            },
            { $unwind: { path: '$price_list', preserveNullAndEmptyArrays: true } }
          ],
          as: 'quote_lines'
        }
      },
      
      // Remove the temporary account_info field
      {
        $project: {
          account_info: 0
        }
      }
    ];

    const result = await Quote.aggregate(pipeline);

    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'No quote found for the specified contact ID',
        contactId: contactId 
      });
    }

    // If multiple quotes found for the same contact, you might want to return all of them
    // or add additional filtering logic here
    if (result.length === 1) {
      res.json(result[0]); // Return the single quote
    } else {
      // Return all quotes for this contact
      res.json({
        message: `Found ${result.length} quotes for contact`,
        contactId: contactId,
        quotes: result
      });
    }

  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};