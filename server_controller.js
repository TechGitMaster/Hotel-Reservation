const express = require('express');
const router = express();

router.use('/', require('./nodejs/login_signup'));

module.exports = router;
