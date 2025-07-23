const express = require('express');
const router = express.Router();
const TMFOrder = require('../../../models/order');

router.post('/order', async (req, res) => {
  try {
    console.log('Received TMF Order:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body.order || !req.body.order.sys_id) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Order object must contain sys_id' 
      });
    }

    // Use sys_id as the unique identifier
    const updatedOrder = await TMFOrder.findOneAndUpdate(
      { 'rawOrder.order.sys_id': req.body.order.sys_id }, // Match by sys_id
      { 
        rawOrder: req.body,
        updatedAt: new Date(),
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, new: true }
    );

    console.log('Order processed:', updatedOrder);
    res.status(200).json({
      success: true,
      action: updatedOrder ? 'updated' : 'created',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;