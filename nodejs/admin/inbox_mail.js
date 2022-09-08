require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const middleware_admin = require('./authorization');
const db_column = require('../databases/inboxes_column');
const logReg_column = require('../databases/logReg_column');
const sched_column = require('../databases/sched_column');

const data_login = logReg_column('login_accounts');
const inbox_col = db_column('admin_inbox');
const favo_col = db_column('admin_favorite');
const accept_col = db_column('admin_accepted');
const decline_col = db_column('admin_declined');
const trash_col = db_column('admin_trash');
const sched_col = sched_column('admin_calendarsched'); 
const timeDate_accepted = sched_column('accepted_MailTime'); 
const inboxes_column_user = require('../databases/inboxes_user_column')('user_pending_mail');


//Saving appointment and contact us more mail_____________________________________
router.get('/inboxSaving_user', middleware_user, (req, res) => {
    const email = req.condition ? req.email: '';

    if(email !== ''){
        new inboxes_column_user({
            fullname: req.query.fullname,
            email: email,
            reserved_email: req.query.reserved_email,
            numGuest: req.query.numGuest,
            contact_num: req.query.contact_num,
            message: req.query.message,
            dateArrival: req.query.dateArrival,
            timeDate: req.query.timeDate,
            acceptedNot: 'new',
            newNot: true  
        }).save().then((data) => {
            new inbox_col({
                usermail_id: data._id,
                fullname: req.query.fullname,
                email: email,
                reserved_email: req.query.reserved_email,
                numGuest: req.query.numGuest,
                contact_num: req.query.contact_num,
                message: req.query.message,
                dateArrival: req.query.dateArrival,
                timeDate: req.query.timeDate,
                favorite: false,
                acceptedNot: 'new',
                appointmentNot: req.query.appointmentNot,
                newNot: true
            }).save().then(() => {
                //send email to the admin_____________________________________
                res.json({ response: 'success' });
            });  
        });
    }else{
        new inbox_col({
            usermail_id: '',
            fullname: req.query.fullname,
            email: email,
            reserved_email: req.query.reserved_email,
            numGuest: req.query.numGuest,
            contact_num: req.query.contact_num,
            message: req.query.message,
            dateArrival: req.query.dateArrival,
            timeDate: req.query.timeDate,
            favorite: false,
            acceptedNot: 'new',
            appointmentNot: req.query.appointmentNot,
            newNot: true
        }).save().then(() => {
            //send email to the admin_____________________________________
            res.json({ response: 'success' });
        });  
    }

});



//middleware_user_____________________________________________
function middleware_user(req, res, next){
    const auth = req.headers['authorization'];
    req.condition = false;
    if(typeof auth !== 'undefined'){
        const token = auth.split(' ')[1];
        if(token !== ''){
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
                if(err) {
                    next();
                }else{
                    data_login.findOne({ email: result.email }).then((dataRest) => {
                        if(dataRest != null){
                            if(dataRest.admin !== 'admin'){
                                req.email = dataRest.email;
                                req.condition = true;
                                next();
                            }else{
                                res.sendStatus(401);
                            }
                        }else{
                            res.sendStatus(401);
                        }
                    });
                } 
            });
        }else{
            next();
        }
    }else{
        next();
    }
}

//Get inbox mail admin__________________________________________________________
router.post('/getinboxAdmin', middleware_admin, async (req, res) => {
    const { skip, limit } = req.body.data;
    const data = await inbox_col.find().sort({ createdAt: 'descending' }).skip(skip).limit(limit);
    const count_data = await inbox_col.find();
    if(data.length > 0){
        res.json({ response: 'success', data: data, count_data: count_data.length });
    }else{
        res.json({ response: 'no-data' });
    }
});


//Save mail into Favorites, Accept, Declined and Trash routers__________________________________________________________

//save the mail to favorite admin___________________________________
router.post('/saveNotFavorite', middleware_admin, async (req, res) => {
    const { id, condition, name_column } = req.body.datas;

    let data = null;

    switch(name_column){
        case 'inbox':
            data = await inbox_col.findOne({ _id: id });
        break;
        case 'accept':
            data = await accept_col.findOne({ IDS: id });
        break;
        case 'decline':
            data = await decline_col.findOne({ IDS: id });
        break;
    }

    if(!condition){
        new favo_col({
            IDS: id,
            usermail_id: data.usermail_id,
            fullname: data.fullname,
            email: data.email,
            reserved_email: data.reserved_email,
            numGuest: data.numGuest,
            contact_num: data.contact_num,
            message: data.message,
            dateArrival: data.dateArrival,
            timeDate: data.timeDate,
            favorite: true,
            acceptedNot: data.acceptedNot,
            appointmentNot: data.appointmentNot
        }).save().then(re => {  

            inbox_col.updateOne({ _id: id }, { $set: { favorite: true } }).then(() => {
                accept_col.updateOne({ IDS: id }, { $set: { favorite: true } }).then(() => {
                    decline_col.updateOne({ IDS: id }, { $set: { favorite: true } }).then(() => {
                        res.json({ response: 'success' });
                    });
                });
            });
        });
    }else{
        inbox_col.updateOne({ _id: id }, { $set: { favorite: false } }).then(() => {
            accept_col.updateOne({ IDS: id }, { $set: { favorite: false } }).then(() => {
                decline_col.updateOne({ IDS: id }, { $set: { favorite: false } }).then(() => {
                    favo_col.deleteOne({ IDS: id }).then(() => {
                        res.json({ response: 'success' });
                    });
                });
            });
        });
    }
});



//Accept or Decline Message appointment____________________________________________
router.post('/acceptDecline_Appointments', middleware_admin, async (req, res) => {
    var { id, condition, name_column, firstFirst } = req.body.datas;

    let data = null;
    if(name_column === 'inbox'){
        data = await inbox_col.findOne({ _id: id });
    }else{
        data = await favo_col.findOne({ IDS: id });
    }

    //accepted__________________
    if(condition === 'true'){
        let find = null;
        if(firstFirst) find = await timeDate_accepted.findOne({ timeDate: data.dateArrival });

        if(find == null){

            inbox_col.updateOne({ _id: id }, { $set: { acceptedNot: condition } }).then(() => {
                new accept_col({
                        IDS: id,
                        usermail_id: data.usermail_id,
                        fullname: data.fullname,
                        email: data.email,
                        reserved_email: data.reserved_email,
                        numGuest: data.numGuest,
                        contact_num: data.contact_num,
                        message: data.message,
                        dateArrival: data.dateArrival,
                        timeDate: data.timeDate,
                        favorite: data.favorite,
                        acceptedNot: condition,
                        appointmentNot: data.appointmentNot
                    }).save().then(() => {
                        
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
                            appointmentNot: data.appointmentNot
                        }).save().then(() => {
                            favo_col.updateOne({ IDS: id }, { $set: { acceptedNot: condition }}).then(async () => {
                                    
                                new timeDate_accepted({
                                    IDS: id,
                                    timeDate: data.dateArrival,
                                    time: schedDate[0].split(" ")[0],
                                    date: schedDate[1]
                                }).save().then(() => {

                                    if(data.usermail_id !== ''){
                                        inboxes_column_user.updateOne({ _id: data.usermail_id }, { $set: { acceptedNot: 'true' } } ).then(() => {
                                            //send email to the user and notification_____________________________________
                                            res.json({ response: 'success' });
                                        });
                                    }else{
                                        //send email to the user_____________________________________
                                        res.json({ response: 'success' });
                                    }
                                });
                                
                            });
                        });
                });
            });
        }else{
            res.json({ response: 'have' });
        }
    }else{
        //Decline_____________________

        inbox_col.updateOne({ _id: id }, { $set: { acceptedNot: condition } }).then(() => {
            new decline_col({
                IDS: id,
                usermail_id: data.usermail_id,
                fullname: data.fullname,
                email: data.email,
                reserved_email: data.reserved_email,
                numGuest: data.numGuest,
                contact_num: data.contact_num,
                message: data.message,
                dateArrival: data.dateArrival,
                timeDate: data.timeDate,
                favorite: data.favorite,
                acceptedNot: condition,
                appointmentNot: data.appointmentNot
            }).save().then(() => {
                
                favo_col.updateOne({ IDS: id }, { $set: { acceptedNot: condition }}).then(() => {

                    if(data.usermail_id !== ''){
                        inboxes_column_user.updateOne({ _id: data.usermail_id }, { $set: { acceptedNot: 'false' } } ).then(() => {
                            //send email to the user and notification_____________________________________
                            res.json({ response: 'success' });
                        });    
                    }else{
                        inboxes_column_user.updateOne({ _id: data.usermail_id }, { $set: { acceptedNot: 'false' } } ).then(() => {
                            //send email to the user_____________________________________
                            res.json({ response: 'success' });
                        });
    
                    }
                    
                });
            });
        });
    }

});


//UnNew the message________________________________________________________________
router.post('/unewMessage', middleware_admin, (req, res) => {
    var { id } = req.body.datas;
    inbox_col.updateOne({ _id: id }, { $set: { newNot: false } }).then(() => res.json({ response: 'success' }));
});


//Get the Favorite, Accept, Decline, Trash mails routers__________________________________________________________________

//get the favorite mail_______________________________________
router.post('/getFavorite', middleware_admin, async (req, res) => {    
    const { skip, limit } = req.body.data;
    const data = await favo_col.find().sort({ createdAt: 'descending' }).skip(skip).limit(limit);
    const count_data = await favo_col.find();
    if(data.length > 0){
        res.json({ response: 'success', data: data, count_data: count_data.length });
    }else{
        res.json({ response: 'no-data' });
    }
});



//Get Accept, Decline Data mails router___________________________________________________________________________
router.post('/getAcceptDecline', middleware_admin, async (req, res) => {
    const { skip, limit, condition_AD } = req.body.data;
    let data = null;
    let count_data = null;

    if(condition_AD === 'accepted') {
        data = await accept_col.find().sort({ createdAt: 'descending' }).skip(skip).limit(limit);
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


//Get Trash mails router_____________________________________________________________________________________________________
router.post('/getTrashMails', middleware_admin, async (req, res) => {
    const { skip, limit } = req.body.data;
    const data = await trash_col.find().sort({ createdAt: 'descending' }).skip(skip).limit(limit);
    const count_data = await trash_col.find();
    if(data.length > 0){
        res.json({ response: 'success', data: data, count_data: count_data.length });
    }else{
        res.json({ response: 'no-data' });
    }
});



//Delete the Mail, Favorite, Accepted and Decline mails and save it to Trash data router________________________________________________
router.post('/deleteMails', middleware_admin, async (req, res) => {
    const { ids_arr, name_column } = req.body.datas;

    let data_column = null;
    
    switch(name_column){
        case 'inbox':
            data_column = inbox_col;
        break;
        case 'favorite':
            data_column = favo_col;
        break;
        case 'accept':
            data_column = accept_col;
        break;
        case 'decline':
            data_column = decline_col;
        break;
    }

    var count = 0;
    for await (let id of ids_arr){

        var data_mail = null;

        //Find the mail using Id of mail_________________________________________________
        if(name_column !== 'inbox'){
            data_mail = await data_column.findOne({ IDS: id[0] })
        }else {
            data_mail = await data_column.findOne({ _id: id[0] });
        }

        if(data_mail != null){
            //After find the mail, save the data to Trash mail______________________________________
            await new trash_col({
                IDS: data_mail._id,
                usermail_id: data_mail.usermail_id,
                fullname: data_mail.fullname,
                email: data_mail.email,
                reserved_email: data_mail.reserved_email,
                numGuest: data_mail.numGuest,
                contact_num: data_mail.contact_num,
                message: data_mail.message,
                dateArrival: data_mail.dateArrival,
                timeDate: data_mail.timeDate,
                favorite: data_mail.favorite,
                acceptedNot: data_mail.acceptedNot,
                appointmentNot: data_mail.appointmentNot
            }).save();


            //Delete the mail in Favorite, Accept, Decline and Inbox__________________________________________
            if(name_column !== 'inbox'){
            
                //When deleting the favorite mail data check if it still exist in Inbox and-
                //if exist Update Inbox and set the favorite column into false________________________
                if(name_column === 'favorite'){
                    await inbox_col.updateOne({ _id: id[0] }, { $set: { favorite: false } });
                    await accept_col.updateOne({ IDS: id[0] }, { $set: { favorite: false } });
                    await decline_col.updateOne({ IDS: id[0] }, { $set: { favorite: false } });
                }

                await data_column.deleteOne({ IDS: id[0] });
            }else{
                await data_column.deleteOne({ _id: id[0] });
            }
        }

        count++;
        if(count >= ids_arr.length){
            res.json({ response: 'success'});
        }
    }
});




//Delete permanently Mails from Trash mail_____________________________________________________
router.post('/deleteMailTrash', middleware_admin, async(req, res) => {

    //ID na ng admin_trashes not the IDS________________________________________________
    const { ids_arr } = req.body.datas;

    let count = 0;
    for await (let data of ids_arr){
        await trash_col.deleteOne({ _id: data[0] });

        count++;
        if(count+1 >  ids_arr.length){
            res.json({ response: 'success' });
        }
    }

});




module.exports = router;