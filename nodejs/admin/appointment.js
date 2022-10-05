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
                message = 'No deleted appointment ever recorded.';
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
    var { id, condition, firstFirst, date } = req.body.datas;

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
                                    message: 'Your appointment has been accepted by the admin.',
                                    date: date,
                                    deleteNot: 'new'
                                }).save().then(async () => {
                                    
                                    let data_check = await notification_click_col.findOne({ email: data.email });
                                    let numbers = data_check.number+1;

                                    notification_click_col.updateOne({ email: data.email },
                                        { $set: { number: numbers, clicked: true } }).then(() => {

                                        //send mail to the user_______________________________________
                                        res.json({ response: 'success'});
                                    });
                                }); 

                            });
                        }else{
                            //send email to the user_____________________________________
                            res.json({ response: 'success' });
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
                        message: 'Your appointment has been declined by the admin.',
                        date: date,
                        deleteNot: 'new'
                    }).save().then(async () => {
                        
                        let data_check = await notification_click_col.findOne({ email: data.email });
                        let numbers = data_check.number+1;

                        notification_click_col.updateOne({ email: data.email },
                            { $set: { number: numbers, clicked: true } }).then(() => {

                            //send mail to the user_______________________________________
                            res.json({ response: 'success'});
                        });
                    }); 

                });    
            }else{
                //send email to the user_____________________________________
                res.json({ response: 'success' });
            }
        }
    });

});


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