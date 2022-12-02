require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const middleware_admin = require('./authorization');
const db_column = require('../databases/inboxes_column');
const logReg_column = require('../databases/logReg_column');

const data_login = logReg_column('login_accounts');
const inbox_col = db_column('admin_inbox');

const favo_col = db_column('admin_favorite');
const trash_col = db_column('admin_trash');
const inboxes_column_user = require('../databases/inboxes_user_column')('user_pending_mail');

const admin_calendarsched = require('../databases/sched_column')('admin_calendarsched');
const admin_user_reservation = require('../databases/rooms_column')('admin_user_reservation');

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


//Saving appointment and contact us more mail_____________________________________
router.get('/inboxSaving_user', middleware_user, (req, res) => {
    const email = req.condition ? req.email: '';

    const arr_tem = [req.query.appointmentNot, 'appointments_message'];
    var _id = mongoose.Types.ObjectId();

    if(email !== ''){
        if(arr_tem[0] !== 'inquery'){
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
                newNot: true,
                deleteNot: false,
                guest_member: req.query.guest_member,
                transaction_ID: req.query.transaction_ID
            }).save().then(async (data) => {
                inbox_col_save(req, res, arr_tem, _id, data._id, email);
            });
        }else{
            inbox_col_save(req, res, arr_tem, _id, '', email);
        }
    }else{
        inbox_col_save(req, res, arr_tem, _id, '', email);
    }

});

async function inbox_col_save(req, res, arr_tem, _id, data, email){
    if(arr_tem[0] !== 'inquery'){
        //For appointment____________________________________________
        for await(let tell of arr_tem){
            if(tell === 'appointments_message'){
    
                await new inbox_col({
                    _id: _id,
                    usermail_id: '',
                    fullname: req.query.fullname,
                    email: email === '' ? req.query.reserved_email: email,
                    reserved_email: 'Bot message',
                    numGuest: '',
                    contact_num: '',
                    message: `New appointment request. Transaction ID: ${req.query.transaction_ID}.`,
                    dateArrival: '',
                    timeDate: req.query.timeDate,
                    favorite: false,
                    acceptedNot: 'new',
                    appointmentNot: tell,
                    newNot: true,
                    folderName: 'inbox',
                    deleteNot: 'false'
                }).save().then(() => {
                    sendEmail(res, req.query.transaction_ID, 'Appointment', email === '' ? req.query.reserved_email: email)
                });
    
            }else{
                var _ids = mongoose.Types.ObjectId();
    
                await new inbox_col({
                    _id: _ids,
                    usermail_id: data,
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
                    appointmentNot: tell,
                    newNot: true,
                    folderName: 'inbox',
                    guest_member: req.query.guest_member,
                    transaction_ID: req.query.transaction_ID,
                    deleteNot: 'false'
                }).save();
            }
        }
    }else{
        //For inquery___________________________________________________
        var _ids = mongoose.Types.ObjectId();
    
        await new inbox_col({
            _id: _ids,
            usermail_id: data,
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
            appointmentNot: arr_tem[0],
            newNot: true,
            folderName: 'inbox',
            guest_member: req.query.guest_member,
            transaction_ID: req.query.transaction_ID,
            deleteNot: 'false'
        }).save().then(() =>{
            sendEmail(res, '', 'Inquery', req.query.reserved_email)
        });
    }
}


//send email to user__________________________________________________________
function sendEmail(res, transaction_ID, condition, email){

    let data = {
        header: condition, 
        message: `New ${condition} request. ${ condition !== 'Inquery' ? `Transaction ID: ${transaction_ID}`:''}`
    }

    transporter.sendMail({
        from: email,
        to: 'abpadillamail@gmail.com',
        subject: `${condition} request`,
        template: 'mail_template',
        context: data,
        attachments: [{
            filename: 'logo.png',
            path: './src/assets/logo/logo.png',
            cid: 'logo'
        }]
    }, (err, info) => {});

    res.json({ response: 'success' });
}


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


//Get dashboard counts______________________________________________________________
router.post('/getCountsDashboard', middleware_admin, async (req, res) => {
    const { date } = req.body;

    const login_log = await data_login.find({ admin: "not-admin" }).count();
    const appointment_log = await inbox_col.find({ acceptedNot: 'new', appointmentNot: 'appointment', deleteNot: 'false' }).count();
    const calendarsched_log = await admin_calendarsched.find({ date: date }).count();
    const reservation_log = await admin_user_reservation.find({ delete_admin: 'false', confirmNot: 'new' }).count();

    res.json({ counts: [login_log, appointment_log, calendarsched_log, reservation_log ] });
});



//Get inbox mail admin__________________________________________________________
router.post('/getinboxAdmin', middleware_admin, async (req, res) => {
    const { skip, limit } = req.body.data;
    const data = await inbox_col.find({ $or: [{appointmentNot: 'appointments_message'}, 
    {appointmentNot: 'void_app'}, {appointmentNot: 'reservation'}, {appointmentNot: 'inquery'}] }).sort({ createdAt: 'descending' }).skip(skip).limit(limit);
    const count_data = await inbox_col.find({ $or: [{appointmentNot: 'appointments_message'}, 
    {appointmentNot: 'void_app'}, {appointmentNot: 'reservation'}, {appointmentNot: 'inquery'}] });
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

    const data = await inbox_col.findOne({ _id: id });

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
            appointmentNot: data.appointmentNot,
            folderName: 'favorite',
            deleteNot: 'false'
        }).save().then(re => {  

            inbox_col.updateOne({ _id: id }, { $set: { favorite: true } }).then(() => {
                res.json({ response: 'success' });
            });
        });
    }else{
        inbox_col.updateOne({ _id: id }, { $set: { favorite: false } }).then(() => {
            favo_col.deleteOne({ IDS: id }).then(() => {
                res.json({ response: 'success' });
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
                IDS: name_column === 'inbox' ? data_mail._id: data_mail.IDS,
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
                appointmentNot: data_mail.appointmentNot,
                folderName: data_mail.folderName,
                deleteNot: 'false'
            }).save();


            //Delete the mail in Favorite, Accept, Decline and Inbox__________________________________________
            if(name_column !== 'inbox'){
            
                //When deleting the favorite mail data check if it still exist in Inbox and-
                //if exist Update Inbox and set the favorite column into false________________________
                if(name_column === 'favorite'){
                    await inbox_col.updateOne({ _id: id[0] }, { $set: { favorite: false } });
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


//Retrive data and assign them to their folder____________________________________________________
router.post('/retriveMails', middleware_admin, async (req, res) => {

    const { ids_arr } = req.body.datas;

    const data = await trash_col.findOne({ _id:ids_arr[0][0] });

    var data_column = null;
    switch(ids_arr[0][2]){
        case 'inbox':
            data_column = inbox_col;
        break;
        case 'favorite':
            data_column = favo_col;
        break;
    }

    if(ids_arr[0][2] !== 'inbox'){
        new data_column({
            IDS: data.IDS,
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
            acceptedNot: data.acceptedNot,
            appointmentNot: data.appointmentNot,
            folderName: data.folderName,
            deleteNot: 'false'
        }).save().then(async (ress) => {
            if(ids_arr[0][2] === 'favorite'){
                await inbox_col.updateOne({ _id: data.IDS }, { $set: { favorite: true } });
            }else{
                const find = await favo_col.findOne({ IDS: data.IDS });
                
                if(find != null){
                    await inbox_col.updateOne({ _id: data.IDS }, { $set: { favorite: true } });
                }else{
                    await inbox_col.updateOne({ _id: data.IDS }, { $set: { favorite: false } });
                }
            }

            trash_col.deleteOne({ _id: ids_arr[0][0] }).then(() => {
                res.json({ response: 'success' });
            });
        });
    }else{
        var _id = data.IDS;
        new data_column({
            _id: _id,
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
            acceptedNot: data.acceptedNot,
            appointmentNot: data.appointmentNot,
            folderName: data.folderName,
            newNot: false,
            deleteNot: 'false'
        }).save().then(async () => {
            const find = await favo_col.findOne({ IDS: data.IDS });
                
            if(find != null){
                await inbox_col.updateOne({ _id: data.IDS }, { $set: { favorite: true } });
            }else{
                await inbox_col.updateOne({ _id: data.IDS }, { $set: { favorite: false } });
            }

            trash_col.deleteOne({ _id: ids_arr[0][0] }).then(() => {
                res.json({ response: 'success' });
            });  
        });
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