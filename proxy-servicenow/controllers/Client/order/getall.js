const jwt = require('jsonwebtoken');
const Order = require('../../../models/order');
const Account = require('../../../models/account');
const Contact = require('../../../models/Contact');
const { handleMongoError } = require('../../../utils/handleMongoError');

async function getOrders(req, res) {
  try {
    // Extract query parameters
    const { q: searchTerm, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    console.log(req.headers.authorization?.replace('Bearer ', ''))
    // Verify JWT token and extract contact ID
    let token;
try {
  const authHeader = JSON.parse(req.headers.authorization);
  token = authHeader.token;
} catch (err) {
  // Fallback to standard Bearer token if parsing fails
  token = req.headers.authorization?.replace('Bearer ', '');
}

if (!token) {
  return res.status(401).json({ 
    success: false,
    error: 'Authorization token required' 
  });
}

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const contactId = decoded.id;
    console.log('Extracted Contact ID from token:', contactId);
    
    if (!contactId) {
      return res.status(401).json({ error: 'Invalid token - missing contact ID' });
    }

    // 1. Find the Contact to get Account ID
    const contact = await Contact.findById(contactId).select('account').lean();
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (!contact.account) {
      return res.status(400).json({ error: 'Contact is not associated with an account' });
    }

    console.log('Found Account ID in Contact:', contact.account);

    // 2. Find the Account to get ServiceNow sys_id
    const account = await Account.findById(contact.account).select('sys_id').lean();
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if (!account.sys_id) {
      return res.status(400).json({ error: 'Account missing ServiceNow sys_id' });
    }

    const serviceNowSysId = account.sys_id;
    console.log('Found ServiceNow sys_id:', serviceNowSysId);

    // 3. Build base query
    const query = { 'rawOrder.order.account': serviceNowSysId };

    // Add search functionality
    if (searchTerm) {
      query.$or = [
        { 'rawOrder.order.number': { $regex: searchTerm, $options: 'i' } },
        { 'rawOrder.order.short_description': { $regex: searchTerm, $options: 'i' } },
        { 'rawOrder.lineItems': { 
          $elemMatch: {
            $or: [
              { 'short_description': { $regex: searchTerm, $options: 'i' } },
              { 'number': { $regex: searchTerm, $options: 'i' } },
              { 'product_offering': searchTerm },
              { 'external_id': searchTerm }
            ]
          }
        }}
      ];
    }

    // 4. Execute queries
    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ 'rawOrder.order.order_date': -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .select({
          '_id': 1,
          'rawOrder.order.number': 1,
          'rawOrder.order.order_date': 1,
          'rawOrder.order.state': 1,
          'rawOrder.order.status': 1,
          'rawOrder.order.short_description': 1,
          'rawOrder.order.total_monthly_recurring_price': 1,
          'rawOrder.order.mrc': 1,
          'rawOrder.order.order_currency': 1,
          'rawOrder.lineItems': 1,
          'updatedAt': 1
        })
    ]);

    // Transform the data with defensive checks
    const filteredOrders = orders.map(order => {
      // Safely access nested properties
      const rawOrder = order.rawOrder || {};
      const orderData = rawOrder.order || {};
      const lineItems = Array.isArray(rawOrder.lineItems) ? rawOrder.lineItems : [];

      return {
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
          // Removed characteristics from here
        })),
        updatedAt: order.updatedAt
      };
    });

    return res.json({
      success: true,
      data: filteredOrders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in getOrders:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // Handle MongoDB errors
    if (error.name === 'MongoServerError') {
      return res.status(400).json({ error: 'Database error occurred' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = getOrders;