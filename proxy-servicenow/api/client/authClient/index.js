const express = require('express');
const router = express.Router();

const Login = require('../../../controllers/Client/AuthClient/login');


router.post('/client-login', Login);

module.exports = router;