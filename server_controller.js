const express = require('express');
const app = express();

app.use('/', require('./nodejs/login_signup'));
app.use('/', require('./nodejs/admin/inbox_mail'));
app.use('/', require('./nodejs/admin/sched'));
app.use('/', require('./nodejs/admin/room'));
app.use('/', require('./nodejs/admin/reservation'));
app.use('/', require('./nodejs/admin/appointment'));
app.use('/', require('./nodejs/user/notification'));
app.use('/', require('./nodejs/user/appointment'));
app.use('/', require('./nodejs/user/reservation'));
app.use('/', require('./nodejs/user/archive'));
app.use('/', require('./nodejs/user/payment'));
app.use('/', require('./nodejs/admin/appointment_void'));
app.use('/', require('./nodejs/send_view_reservation'));


module.exports = app;
