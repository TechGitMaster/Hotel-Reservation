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
const favo_col = db_column_inboxes('admin_favorite');
const accept_col = db_column_inboxes('admin_accepted');
const trash_col = db_column_inboxes('admin_trash');
const inboxes_column_user = require('../databases/inboxes_user_column')('user_pending_mail');

const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'October', 'Nov', 'Dec'];


//This is for getting Current Appointment Schedule____________________________________________
router.get('/getAllSched', middleware_admin, async (req, res) => {

    const data = await calendar_sched_col.find();
    if(data.length > 0){
        res.json({response: 'success', data: data})   
    }else{
        res.json({response: 'no-data'})   
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


//This is to deleteEvent____________________________________________________________________________
router.post('/deleteEvent', middleware_admin, async (req, res) => {
    let { id } = req.body.datas;

    const data = await calendar_sched_col.findOne({ _id: id });

    calendar_sched_col.deleteOne({ _id: id }).then(() => {

        accepted_timeDate.deleteOne({ IDS: data.IDS }).then(() => {

            inbox_col.updateOne({ _id: data.IDS }, { $set: { acceptedNot: 'true false' } }).then(() => {
                favo_col.updateOne({ IDS: data.IDS }, { $set: { acceptedNot: 'true false' } }).then(() => {
                    accept_col.updateOne({ IDS: data.IDS }, { $set: { acceptedNot: 'true false' } }).then(() => {
                        trash_col.updateOne({ IDS: data.IDS }, { $set: { acceptedNot: 'true false' } }).then(async () => {

                            if(data.usermail_id !== ''){
                                inboxes_column_user.updateOne({ _id: data.usermail_id }, { $set: { acceptedNot: 'true false' } }).then(() => {
                                    //Send mail to user and notification that the admin canceled the appointment_______________________________________________
                                    res.json({ response: 'success' });
                                });
                            }else{
                                //Send mail to user that the admin canceled the appointment_______________________________________________
                                res.json({ response: 'success' });
                            }
                            
                            
                        });
                    });
                });
            });

        });
    });

});


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