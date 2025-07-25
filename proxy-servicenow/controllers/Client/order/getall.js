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

    // Verify JWT token and extract contact ID
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
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

    // 3. Build query to find orders where rawOrder.order.account matches the sys_id
    const query = { 'rawOrder.order.account': serviceNowSysId };

    // Debug: Log the query being executed
    console.log('Executing query:', JSON.stringify(query, null, 2));

    // Add search functionality
    if (searchTerm) {
      query.$or = [
        { 'rawOrder.order.number': { $regex: searchTerm, $options: 'i' } },
        { 'rawOrder.order.short_description': { $regex: searchTerm, $options: 'i' } },
        { 'rawOrder.order.lineItems.short_description': { $regex: searchTerm, $options: 'i' } },
        { 'rawOrder.order.lineItems.number': { $regex: searchTerm, $options: 'i' } },
        { 'rawOrder.order.lineItems.product_offering': searchTerm },
        { 'rawOrder.order.lineItems.external_id': searchTerm }
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
    ]);

    // Debug: Log the results
    console.log(`Found ${orders.length} orders out of ${total} total`);
    if (orders.length > 0) {
      console.log('First order account:', orders[0].rawOrder.order.account);
    }

    return res.json({
      success: true,
      data: orders,
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
    
    const { status, message } = handleMongoError(error);
    return res.status(status).json({ error: message });
  }
}

module.exports = getOrders;