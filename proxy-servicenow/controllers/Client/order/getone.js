const Order = require('../../../models/order');
const mongoose = require('mongoose');
const { handleMongoError } = require('../../../utils/handleMongoError');

async function getOrderById(req, res) {
  try {
    // Validate order ID parameter
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    // Find the order by ID
    const order = await Order.findById(orderId)
      .select({
        '_id': 1,
        'rawOrder.order': 1,
        'rawOrder.lineItems': 1,
        'updatedAt': 1
      })
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Transform the data
    const rawOrder = order.rawOrder || {};
    const orderData = rawOrder.order || {};
    const lineItems = Array.isArray(rawOrder.lineItems) ? rawOrder.lineItems : [];

    const response = {
      _id: order._id,
      number: orderData.number || '',
      order_date: orderData.order_date || '',
      state: orderData.state || '',
      status: orderData.status || '',
      description: orderData.short_description || '',
      total_price: orderData.total_monthly_recurring_price || orderData.mrc || 0,
      currency: orderData.order_currency || 'USD',
      lineItems: lineItems.map(item => ({
        id: item.sys_id || '',
        number: item.number || '',
        description: item.short_description || '',
        state: item.state || '',
        status: item.status || '',
        price: item.mrc || 0,
        quantity: item.quantity || 0
      })),
      updatedAt: order.updatedAt
    };

    return res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error in getOrderById:', error);
    
    if (error.name === 'MongoServerError') {
      return handleMongoError(res, error);
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = getOrderById;