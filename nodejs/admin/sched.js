require('dotenv').config();
const express = require('express');
const router = express.Router();

const middleware_admin = require('./authorization');

const db_column = require('../databases/sched_column');
const calendar_sched_col = db_column('admin_calendarsched');
const timeAMPMDate_col = db_column('admin_timeAMPM_Date');
const accepted_timeDate = db_column('accepted_MailTime');

const db_column_inboxes = require('../databases/inboxes_column');
const inbox_col = db_column_inboxes('admin_inbox');
const inboxes_column_user = require('../databases/inboxes_user_column')('user_pending_mail');

const logReg_column = require('../databases/logReg_column');
const data_reg = logReg_column('registered_accounts');

const notification_db = require('../databases/notification_column');
const notification_col = notification_db('user_notification');
const notification_click_col = notification_db('user_notification_click');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD_MAIL
    }
});


//This is for getting Current Appointment Schedule____________________________________________
router.get('/getAllSched', middleware_admin, async (req, res) => {

    const data = await calendar_sched_col.find({ delete_admin: false });
    if(data.length > 0){
        res.json({response: 'success', data: data})   
    }else{
        res.json({response: 'no-data'})   
    }
});


//This is for getting deleted appointment__________________________________________________________________________
router.get('/getDeleteAppointment', middleware_admin, async (req, res) => {
    const data = await calendar_sched_col.find({ delete_admin: true });

    if(data.length > 0){
        res.json({ response: 'success', data: data });
    }else{
        res.json({ response: 'no-data' });
    }
});


//This is to get the AM, PM and DATE___________________________________________________________
router.get('/AmPmDate_get', middleware_admin, async (req, res) => {
    const data = await timeAMPMDate_col.findOne({ name: 'timeDate' });
    res.json(data);
});


//This is for saving the time AM________________________________________________________
router.post('/Am_save', middleware_admin, (req, res) => {

    const { AM } = req.body.datas;
    timeAMPMDate_col.updateOne({ name: 'timeDate' }, { $set: { 
        AM: AM
     } }).then(() => {
        res.json({ response: 'success' });
    });

});


//This is for saving the time PM________________________________________________________
router.post('/Pm_save', middleware_admin, (req, res) => {

    const { PM } = req.body.datas;
    timeAMPMDate_col.updateOne({ name: 'timeDate' }, { $set: { 
        PM: PM
     } }).then(() => {
        res.json({ response: 'success' });
    });

});

router.post('/updateAMPM', middleware_admin, (req, res) => {

    const { PM, AM } = req.body.datas;
    timeAMPMDate_col.updateOne({ name: 'timeDate' }, { $set: { 
        AM: AM,
        PM: PM
     } }).then(() => {
        res.json({ response: 'success' });
    });

});


//This is to save notAvailable date______________________________________________________________
router.post('/notAvailable_save', middleware_admin, async (req, res) => {
    const { arr_date } = req.body.datas;

    timeAMPMDate_col.updateOne({ name: 'timeDate'}, { $set: { DATE: arr_date } }).then(() => {
        res.json({ response: 'success' });
    });
    
});


//Move to trash the event______________________________________________________________
router.post('/deletePermanent', middleware_admin, async (req, res) => {
   let { _id } = req.body;
    
    calendar_sched_col.deleteOne({ _id: _id }).then(() => {
        res.json({ response: 'success' });
    });

});


//retrieve appointment_____________________________________________________________________________________
router.post('/retrieveAppointment', middleware_admin, async (req, res) => {
    const { _id } = req.body;
    calendar_sched_col.updateOne({ _id: _id }, { $set: { delete_admin: false } }).then(() => {
        res.json({ response: 'success' });
    });
});



//This is to "cancelTrashEvent and move to trash"____________________________________________________________________________
router.post('/cancelTrashEvent', middleware_admin, async (req, res) => {
    let { id, cancelDelete, date } = req.body.datas;
    let data_admin = await data_reg.findOne({ email: req.token.email });

    if(!cancelDelete){
        const data = await calendar_sched_col.findOne({ $or:[ { _id: id }, { IDS: id } ]});
        //const data_for_timedate = await inbox_col.findOne({ _id: data.IDS });


        calendar_sched_col.deleteOne({ $or:[ { _id: data.id }, { IDS: data.id }] }).then(() => {
    
            accepted_timeDate.deleteOne({ IDS: data.IDS }).then(() => {
    
                inbox_col.updateOne({ _id: data.IDS }, { $set: { acceptedNot: 'true false' } }).then(() => {
                    if(data.usermail_id !== ''){
                        inboxes_column_user.updateOne({ _id: data.usermail_id }, { $set: { acceptedNot: 'true false' } }).then(() => {

                            //Send mail to user and notification that the admin canceled the appointment_______________________________________________
                            new notification_col({
                                email: data.email,
                                name: data_admin.fullName,
                                message: 'Your appointment has been canceled by the admin. Transaction ID: '+data.transaction_ID,
                                date: date,
                                deleteNot: 'new'
                            }).save().then(async () => {
                                
                                let data_check = await notification_click_col.findOne({ email: data.email });
                                let numbers = data_check.number+1;

                                notification_click_col.updateOne({ email: data.email },
                                    { $set: { number: numbers, clicked: true } }).then(() => {

                                    //send mail to the user_______________________________________
                                    sendEmail(res, data.transaction_ID, data.reserved_email, data.email)
                                });
                            }); 

                        });
                    }else{
                        //Send mail to user that the admin canceled the appointment_______________________________________________
                        sendEmail(res, '', data.reserved_email, '')
                    }
                });
    
            });
        });   
    }else{

        //Move to trash__________________________________________
        calendar_sched_col.updateOne({ _id: id }, { $set: { delete_admin: true } }).then(() => {
            res.json({ response: 'success' });
        });
    }

});



//send email to user__________________________________________________________
function sendEmail(res, transaction_ID, reserved_email, email){

    const message = `Your Appointment request is cancelled by the admin. ${transaction_ID !== '' ? 'Transaction ID: '+transaction_ID:''}`

    transporter.sendMail({
        from: process.env.USER_MAIL,
        to: reserved_email,
        subject: 'Appointment message',
        text: message
    }, (err, info) => {});

    if(email !== ''){
        res.json({ response: 'success', email: email});
    }else{
        res.json({ response: 'success'});
    }
}


//This is to get the accepted Appointment and get the hours and minutes_______________________________________________
//So that when the user click the day in 'set Appointment', this will get the hours and minutes of that day that has an appointment_____________________
router.get('/gettimeDate', middleware_admin, async (req, res) => {
    const { month, day, year } = req.query;
    const date = month+" "+day+" "+year;

    const data = await accepted_timeDate.find({ date: date });

    if(data.length > 0){
        res.json({ response: 'success', data: data });
    }else{
        res.json({ response: 'no-data' });
    }

});




module.exports = router;