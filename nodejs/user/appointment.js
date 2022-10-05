const express = require('express');
const router = express.Router();
const middleware = require('./authorization');
const mongoose = require('mongoose');

const appointment_db = require('../databases/inboxes_user_column');
const appointment_col = appointment_db('user_pending_mail');

const db_column = require('../databases/sched_column');
const calendar_sched_col = db_column('admin_calendarsched');
const accepted_timeDate = db_column('accepted_MailTime');

const db_column_inboxes = require('../databases/inboxes_column');
const inbox_col = db_column_inboxes('admin_inbox');
const favo_col = db_column_inboxes('admin_favorite');
const accept_col = db_column_inboxes('admin_accepted');
const trash_col = db_column_inboxes('admin_trash');

//Get appointment____________________________________________________________
router.post('/getAppointments_user', middleware, async (req, res) => {
    const { skip, limit, radioName } = req.body;
    const { email } = req.token;

    let count = null;
    let data = null;
    let message = '';

    switch(radioName){
        case 'pending':
            count = await appointment_col.find({ email: email, acceptedNot: 'new',deleteNot: false }).count();
            data = await appointment_col.find({ email: email, acceptedNot: 'new',deleteNot: false }).sort({ createdAt: -1 }).skip(skip).limit(limit);
            message = 'No pending request.';
        break;
        case 'accepted':
            count = await appointment_col.find({ email: email, acceptedNot: 'true',deleteNot: false }).count();
            data = await appointment_col.find({ email: email, acceptedNot: 'true',deleteNot: false }).sort({ createdAt: -1 }).skip(skip).limit(limit); 
            message = 'No record of accepted request.';
        break;
        case 'declined':
            count = await appointment_col.find({ email: email, acceptedNot: 'false',deleteNot: false }).count();
            data = await appointment_col.find({ email: email, acceptedNot: 'false',deleteNot: false }).sort({ createdAt: -1 }).skip(skip).limit(limit);
            message = 'No record of declined request.';
        break;
        case 'canceled':
            count = await appointment_col.find({ email: email, acceptedNot: 'true false', deleteNot: false }).count();
            data = await appointment_col.find({ email: email, acceptedNot: 'true false',deleteNot: false }).sort({ createdAt: -1 }).skip(skip).limit(limit);
            message = 'No record of canceled request.';
        break;
    }


    if(data.length > 0){
        res.json({ response: 'success', data: data, count: count });
    }else{
        res.json({ response: 'no-data', message: message });
    }

});


//Cancel appointment________________________________________________________
router.post('/cancelAppointment', middleware, async (req, res) => {
    const { _id, fullname, email, date } = req.body;

    var id = mongoose.Types.ObjectId();

    calendar_sched_col.deleteOne({ usermail_id: _id }).then(() => {
        accepted_timeDate.deleteOne({ usermail_id: _id }).then(() => {
            inbox_col.updateOne({ usermail_id: _id }, { $set: { acceptedNot: 'true false' } }).then(() => {
                favo_col.updateOne({ usermail_id: _id }, { $set: { acceptedNot: 'true false' } }).then(() => {
                    accept_col.updateOne({ usermail_id: _id }, { $set: { acceptedNot: 'true false' } }).then(() => {
                        trash_col.updateOne({ usermail_id: _id }, { $set: { acceptedNot: 'true false' } }).then(() => {
                            appointment_col.updateOne({ _id: _id }, { $set: { acceptedNot: 'true false' } }).then(() => {
                                //Send mail to admin______________________________________________________________
                                new inbox_col({
                                    _id: id,
                                    usermail_id: '',
                                    fullname: fullname,
                                    email: email,
                                    reserved_email: 'Bot message',
                                    numGuest: '',
                                    contact_num: '',
                                    message: 'The user is cancel the appointment.',
                                    dateArrival: '',
                                    timeDate: date,
                                    favorite: false,
                                    acceptedNot: 'new',
                                    appointmentNot: 'cancel_app',
                                    newNot: true,
                                    folderName: 'inbox'
                                }).save().then(() => {
                                    res.json({ response: 'success' });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

});


//Move to trash_______________________________________________________________________________________________________________
router.post('/trash_Moves_appointment', middleware, (req, res) => {
    const { _id } = req.body;

    appointment_col.updateOne({ _id: _id }, { $set: { deleteNot: true } }).then(() => {
        res.json({ response: 'success' });
    });

});


module.exports = router;
