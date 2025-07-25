const express = require('express');
const router = express.Router();

// Import controllers
const getAll = require('../../controllers/account/getall');
const getOne = require('../../controllers/account/getone');
const create = require('../../controllers/account/create');
const deleteAccount = require('../../controllers/account/delete');
const update = require('../../controllers/account/update');

const requestCreation = require('../../controllers/account/service/requestCreation');
const confirmCreation = require('../../controllers/account/service/confirmCreation');
const authjwt = require('../../middleware/auth');
const verifyAccountToken = require('../../controllers/account/verifyAccountToken');
const sendMailInfo = require('../../controllers/account/sendMailInfo');

//routes
router.post('/account',authjwt, create)
router.get('/account',authjwt, getAll);
router.get('/account/:id',authjwt, getOne);
router.delete('/account/:id', authjwt, deleteAccount);
router.patch('/account/:id',update);


router.post('/request-creation', requestCreation);
router.get('/confirm-creation', confirmCreation);

router.get('/verify-account-token/:token', verifyAccountToken);
router.post('/send_mail_info', sendMailInfo);


module.exports = router;