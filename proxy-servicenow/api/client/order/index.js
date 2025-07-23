const express = require('express');
const router = express.Router();

// Import controllers
const create = require('../../../controllers/Client/order/create');
//routes
router.post('/order', create)

module.exports = router;