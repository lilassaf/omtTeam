const express = require('express');
const router = express.Router();

const getall = require('../../../controllers/Client/Quote/getbycontact')
const getone = require('../../../controllers/Client/Quote/getone')


router.get('/quote', getall);
router.get('/quote/:number', getone);
module.exports = router;