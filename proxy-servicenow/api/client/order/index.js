const express = require('express');
const router = express.Router();

// Import controllers
const create = require('../../../controllers/Client/order/create');
const getAll = require('../../../controllers/Client/order/getall');
//routes
router.post('/order', create)
router.get('/order', getAll)

module.exports = router;