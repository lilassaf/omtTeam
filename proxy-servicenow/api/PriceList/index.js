const express = require('express');
const router = express.Router();

// Import controllers
const getAll = require('../../controllers/PriceList/getAllPriceList');
const getOne = require('../../controllers/PriceList/getOnePriceList');
const create = require('../../controllers/PriceList/createPriceList');
const deletePrice = require('../../controllers/PriceList/deletePriceList')
const getOne = require('../../controllers/PriceList/getOnePriceList');


// Define routes
router.get('/price-list', getAll);
router.get('/price-list/:id', getOne);
router.post('/price-list', create);
router.delete('/price-list/:id', deletePrice);
<<<<<<< HEAD
router.get('/price-list/:id',getOne);
=======
router.get('/price-list/:id', getOne);
>>>>>>> f51a9c582772a7a89a4b8d2dd5ecee26195e2add

module.exports = router;