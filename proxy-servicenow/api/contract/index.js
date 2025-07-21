const express = require('express');
const router = express.Router();

// Import controllers

const create = require('../../controllers/Contract/create');
const update = require('../../controllers/Contract/update')
const downlaod = require('../../controllers/Contract/downloadContract')

router.post('/contract/:id', create);
router.patch('/contract/:id', update);
router.get('/download-contract/:id', downlaod);

module.exports = router;

