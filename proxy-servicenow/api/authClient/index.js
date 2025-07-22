const express = require('express');
const router = express.Router();

const Login = require('../../controllers/AuthClient/login');


router.post('/client-login', Login);

module.exports = router;