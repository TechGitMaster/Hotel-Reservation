const express = require('express');
const router = express.Router();

router.use('/', require('./nodejs/trys'));

module.exports = router;
