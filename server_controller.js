const express = require('express');
const router = express();

router.use('/', require('./nodejs/login_signup'));
router.use('/', require('./nodejs/admin/inbox_mail'));
router.use('/', require('./nodejs/admin/sched'));

module.exports = router;
