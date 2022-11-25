require('dotenv').config()
const express = require('express');
const router = express.Router();

const sched_column = require('../databases/sched_column');
const sched_col = sched_column('admin_calendarsched'); 
const timeDate_accepted = sched_column('accepted_MailTime'); 

const db_column = require('../databases/inboxes_column');
const inbox_col = db_column('admin_inbox');

const data_reg = require('../databases/logReg_column')('registered_accounts');

const notification_db = require('../databases/notification_column');
const notification_col = notification_db('user_notification');
const notification_click_col = notification_db('user_notification_click');

const inboxes_column_user = require('../databases/inboxes_user_column')('user_pending_mail');

const middleware = require('./authorization');

const nodemailer = require('nodemailer');
const hbs = require("nodemailer-express-handlebars");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD_MAIL
    }
});

const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: './nodejs/views/',
      defaultLayout: false,
    },
    viewPath: './nodejs/views/',
    extName: ".handlebars",
}

transporter.use('compile', hbs(handlebarOptions));


//Get Accept, Decline Data mails router___________________________________________________________________________
router.post('/getAcceptDecline', middleware, async (req, res) => {
    const { skip, limit, condition_AD } = req.body.data;
    let data = null;
    let count_data = null;

    if(condition_AD === 'accepted') {
        data = await accept_col.find({ appointmentNot: 'appointment' }).sort({ createdAt: 'descending' }).skip(skip).limit(limit);
        count_data = await accept_col.find();
    }
    else {
        data = await decline_col.find().sort({ createdAt: 'descending' }).skip(skip).limit(limit);
        count_data = await decline_col.find();
    }

    if(data.length > 0){
        res.json({ response: 'success', data: data, count_data: count_data.length });
    }else{
        res.json({ response: 'no-data' });
    }
});

//Get the "appointment" data________________________________________________________________
router.post('/getAppointment', middleware, async (req, res) => {
    const { skip, limit, radioCondition, searchingNot, searchString } = req.body;

    let count = null;
    
    let message = 'No query';
    let data = null;

    //Not searching____________________________________________________
    if(!searchingNot){
        switch(radioCondition){
            case 'all':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'new' }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'new'  })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                    
                message = 'No pending appointment request for now.';
            break;
            case 'accepted':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', $or: [{acceptedNot: 'true'}] }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', $or: [{acceptedNot: 'true'}] })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);

                message = 'No accepted appointment ever recorded.';
            break;
            case 'declined':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'false' }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'false' })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);

                message = 'No declined appointment ever recorded.';
            break;
            case 'canceled':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'true false' }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'true false' })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                
                message = 'No canceled appointment ever recorded.';
            break;
            case 'trash':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'true' }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'true' }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                message = 'Empty archive appointment.';
            break;
        }
    }

    //Searching____________________________________________________________
    if(searchingNot){
        switch(radioCondition){
            case 'all':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'new' , $text: { $search: searchString  } }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'new', $text: { $search: searchString  }}).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'accepted':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', $or: [{acceptedNot: 'true'}], 
                    $text: { $search: searchString  } }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', $or: [{acceptedNot: 'true'}], 
                    $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'declined':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'false', $text: { $search: searchString  } }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'false', $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'canceled':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'true false', $text: { $search: searchString  } }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'false', acceptedNot: 'true false', $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'trash':
                count = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'true', $text: { $search: searchString  } }).count();
                data = await inbox_col.find({ appointmentNot: 'appointment', deleteNot: 'true', $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
        }
    }

    if(data.length > 0){    
        res.json({ response: 'success', data: data, count: count });
    }else{
        res.json({ response: message });
    }
});



//Accept or Decline Message appointment____________________________________________
router.post('/acceptDecline_Appointments', middleware, async (req, res) => {
    var { id, condition, firstFirst, date, reason } = req.body.datas;

    let data_admin = await data_reg.findOne({ email: req.token.email });

    let data = await inbox_col.findOne({ _id: id });

    inbox_col.updateOne({ _id: id }, { $set: { acceptedNot: condition } }).then(async () => {
        //accepted__________________
        if(condition === 'true'){
            let find = null;
            if(firstFirst) find = await timeDate_accepted.findOne({ timeDate: data.dateArrival });

            if(find == null){
                //save to schedule calendar_________________________________
                let schedDate = data.dateArrival.split(',');
                new sched_col({
                    IDS: id,
                    usermail_id: data.usermail_id,
                    fullname: data.fullname,
                    email: (data.email !== '' ? data.email: data.reserved_email),
                    reserved_email: data.reserved_email,
                    numGuest: data.numGuest,
                    contact_num: data.contact_num,
                    message: data.message,
                    timeDate: data.dateArrival,
                    date: schedDate[1],
                    transaction_ID: data.transaction_ID,
                    appointmentNot: data.appointmentNot,
                    delete_admin: false
                }).save().then(() => {
                    new timeDate_accepted({
                        IDS: id,
                        timeDate: data.dateArrival,
                        time: schedDate[0].split(" ")[0],
                        date: schedDate[1]
                    }).save().then(() => {
                        
                        if(data.usermail_id !== ''){
                            inboxes_column_user.updateOne({ _id: data.usermail_id }, { $set: { acceptedNot: 'true' } } ).then(() => {

                                //send email to the user and notification_____________________________________
                                new notification_col({
                                    email: data.email,
                                    name: data_admin.fullName,
                                    message: 'Your appointment has been accepted by the admin. Transaction ID: '+data.transaction_ID,
                                    date: date,
                                    deleteNot: 'new'
                                }).save().then(async () => {
                                    
                                    let data_check = await notification_click_col.findOne({ email: data.email });
                                    let numbers = data_check.number+1;

                                    notification_click_col.updateOne({ email: data.email },
                                        { $set: { number: numbers, clicked: true } }).then(() => {

                                        //send mail to the user_______________________________________
                                        sendEmail(res, data.transaction_ID, 'accepted', data.reserved_email, data.dateArrival, reason)
                                    });
                                }); 

                            });
                        }else{
                            //send email to the user_____________________________________
                            sendEmail(res, data.transaction_ID, 'accepted', data.reserved_email, data.dateArrival, reason)
                        }
                    });
                });
            }else{
                res.json({ response: 'have' });
            }
        }else{
            //Decline_____________________

            if(data.usermail_id !== ''){
                inboxes_column_user.updateOne({ _id: data.usermail_id }, { $set: { acceptedNot: 'false' } } ).then(() => {
                    //send email to the user and notification_____________________________________
                    
                    new notification_col({
                        email: data.email,
                        name: data_admin.fullName,
                        message: 'Your appointment has been declined by the admin. Transaction ID: '+data.transaction_ID+(reason.length > 0 ? ' ... Reason: '+reason:''),
                        date: date,
                        deleteNot: 'new'
                    }).save().then(async () => {
                        
                        let data_check = await notification_click_col.findOne({ email: data.email });
                        let numbers = data_check.number+1;

                        notification_click_col.updateOne({ email: data.email },
                            { $set: { number: numbers, clicked: true } }).then(() => {

                            //send mail to the user_______________________________________
                            sendEmail(res, data.transaction_ID, 'declined', data.reserved_email, data.dateArrival, reason)
                        });
                    }); 

                });    
            }else{
                //send email to the user_____________________________________
                sendEmail(res, '', 'declined', data.reserved_email, data.dateArrival, reason)
            }
        }
    });

});


//send email to user__________________________________________________________
function sendEmail(res, transaction_ID, condition, email, dateArrival, reason){

    let message = 
    condition==='accepted' ? `We are pleased to inform you that your appointment on the ${dateArrival} has been approved! 
        Your ${transaction_ID !== '' ? 'Transaction ID: '+transaction_ID:''} We look forward to your visit and we hope you enjoy your stay.`: 
        `We regret to inform you that your appointment on ${dateArrival} has been declined
        Your ${transaction_ID !== '' ? 'Transaction ID: '+transaction_ID:''}`
    ;

    let datas = {
        header: 'Appointment', 
        contact: (condition === 'accepted' ? "For more details for your appointment, please contact +63 917 813 1524.":''),
        message: message,
        reason: (reason.length > 0 ? 'Reason: '+reason:'')
    }

    transporter.sendMail({
        from: process.env.USER_MAIL,
        to: email,
        subject: 'Appointment message',
        template: 'mail_template',
        context: datas,
        attachments: [{
            filename: 'logo.png',
            path: './src/assets/logo/logo.png',
            cid: 'logo'
        }]
    }, (err, info) => {});

    res.json({ response: 'success' });
}


router.post('/moveTotrash_appointment', middleware, (req, res) => {
    inbox_col.updateOne({ _id: req.body.id }, { $set: { deleteNot: 'true' } }).then(() => {
        res.json({ response: 'success' });
    });
});

router.post('/retrieve_appointment_admin', middleware, (req, res) => {
    inbox_col.updateOne({ _id: req.body.id }, { $set: { deleteNot: 'false' } }).then(() => {
        res.json({ response: 'success' });
    });
});

router.post('/delete_Perma_appointment', middleware, (req, res) => {
    inbox_col.deleteOne({ _id: req.body.id }).then(() => {
        res.json({ response: 'success' });
    });
});


module.exports = router;