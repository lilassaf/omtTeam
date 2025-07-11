const express = require('express');
const router = express.Router();

// Import controllers
const create = require('../../controllers/contact/create');
const update = require('../../controllers/contact/update');
const deleteContact = require('../../controllers/contact/delete');
const getAll = require('../../controllers/contact/getall');
const getOne = require('../../controllers/contact/getone');
const authjwt = require('../../middleware/auth');


//routes
router.post('/contact', create)
router.patch('/contact/:id',update);
router.get('/contact/:id', getOne);
router.delete('/contact/:id',authjwt ,deleteContact);
router.get('/contact', getAll);

module.exports = router;