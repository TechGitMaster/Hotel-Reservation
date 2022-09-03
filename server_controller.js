const express = require('express');
const app = express();

app.use('/', require('./nodejs/login_signup'));
app.use('/', require('./nodejs/admin/inbox_mail'));
app.use('/', require('./nodejs/admin/sched'));
app.use('/', require('./nodejs/admin/room'));
app.use('/', require('./nodejs/admin/reservation'));

module.exports = app;
