const express = require('express');
const router = express.Router();

// Import controllers
const create = require('../../../controllers/Client/order/create');
const getAll = require('../../../controllers/Client/order/getall');
const getOne = require('../../../controllers/Client/order/getone');
//routes
router.post('/order', create)
router.get('/order', getAll)
router.get('/order/:id', getOne);

module.exports = router;