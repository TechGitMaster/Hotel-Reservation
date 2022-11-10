require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();

//Middleware admin______________________________________________________________
const middleware_admin = require('./authorization');

//Columns_________________________________________________________________________
const inboxes_column = require('../databases/inboxes_column')('admin_inbox');

const rooms_db = require('../databases/rooms_column');
const reservation_column = rooms_db('admin_user_reservation');
const rooms_column = rooms_db('admin_rooms');


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


//Save reservation request made by user___________________________________________________
router.post('/saveReservation', middleware_user, async (req, res) => {
    const { room_id, checkin_date, checkout_date, acquired_persons, persons_price, total_day_price, total_price, first_name,
        last_name, phone_number, email, image_transaction, transaction_date, paymentMethod, transcation_id, guest_member} = req.body.data;
    const { token } = req;  
    var _id = mongoose.Types.ObjectId();

    if(paymentMethod === 'payment1'){

        if(token != null){
            if(token.adminNot === 'not-admin'){

                //Checking if the user already requested the room_____________________________
                const reservation_check = await reservation_column.find({ room_id: room_id, email_id: token.email }); 
                let condition = true;
                for await(let dd of reservation_check){
                    if(dd.confirmNot === 'true' || dd.confirmNot === 'new'){
                        condition = false;
                    }
                }

                //Checking if room is already reserved____________________________________________________________________
                if(condition){
        
                    const roomdata = await rooms_column.findOne({ _id: room_id });
                    let room_img = roomdata.imgArr[0];
                    let room_name = roomdata.nameRoom;

                    if(roomdata.confirmNot !== 'true'){
                        new reservation_column({
                            room_id: room_id,
                            email_id: token.email,
                
                            img_room: room_img,
                            name_room: room_name,
                            typeRoom2: roomdata.typeRoom2,
                            
                            defaultPrice: roomdata.defaultPrice,
                            paymentMethod: paymentMethod,
                            transaction_id: transcation_id,
            
                            checkin_date: checkin_date,
                            checkout_date:  checkout_date,
                            acquired_persons: acquired_persons,
                            persons_price: persons_price,
                            total_day_price: total_day_price,
                            total_price: total_price,
                            first_name: first_name,
                            last_name: last_name,
                            phone_number: phone_number,
                            email: email,
                            image_transaction: image_transaction,
                            confirmation_date: '',
                            transaction_date: transaction_date,
                            
                            guest_member: guest_member,
    
                            confirmNot: 'new',
                
                            delete_admin: 'false',
                            delete_user: 'false'
                        }).save().then(() => {
                
                            //Send mail to admin______________________________________________________________
                            new inboxes_column({
                                _id: _id,
                                usermail_id: '',
                                fullname: first_name+" "+last_name,
                                email: email,
                                reserved_email: 'Bot message',
                                numGuest: '',
                                contact_num: '',
                                message: `New reservation request. Transaction ID: ${transcation_id}.`,
                                dateArrival: '',
                                timeDate: transaction_date,
                                favorite: false,
                                acceptedNot: 'new',
                                appointmentNot: 'reservation',
                                newNot: true,
                                folderName: 'inbox',
                                guest_member: '',
                                transaction_ID: ''
                            }).save().then(() => {

                                //Send gmail to admin________________________________________________________
                                const message = `New reservation request. Transaction ID: ${transcation_id}.`;
                                transporter.sendMail({
                                    from: email,
                                    to: process.env.USER_MAIL,
                                    subject: 'Reservation request',
                                    text: message
                                }, (err, info) => {});

                                res.json({ response: 'success'});

                            });
                        });
                    }else{
                        res.json({ 'response': 'have' });
                    }
                }else{
                    res.json({ 'response': 'you_already' });
                }
        
            }else{
                res.sendStatus(401);
            }
        }else{
            res.json({ response: 'Need sign in' });
        }

    }else if(paymentMethod === 'payment2'){

        const roomdata = await rooms_column.findOne({ _id: room_id });
        let room_img = roomdata.imgArr[0];
        let room_name = roomdata.nameRoom;

        if(roomdata.confirmNot === 'false'){
            //Save reservation info to column reservation_________________________________________________
            new reservation_column({
                room_id: room_id,
                email_id: (token == null ? '': token.email),

                img_room: room_img,
                name_room: room_name,
                typeRoom2: roomdata.typeRoom2,
                
                defaultPrice: roomdata.defaultPrice,
                paymentMethod: paymentMethod,
                transaction_id: transcation_id,

                checkin_date: checkin_date,
                checkout_date:  checkout_date,
                acquired_persons: acquired_persons,
                persons_price: persons_price,
                total_day_price: total_day_price,
                total_price: total_price,
                first_name: first_name,
                last_name: last_name,
                phone_number: phone_number,
                email: email,
                image_transaction: image_transaction,
                confirmation_date: transaction_date,
                transaction_date: transaction_date,
                
                guest_member: guest_member,

                confirmNot: 'true',

                delete_admin: 'false',
                delete_user: 'false'
            }).save().then(() => {

                //Update the room already reserved_______________________________________________________
                rooms_column.updateOne({ _id: room_id }, { $set: {
                    paymentMethod: paymentMethod,
                    transaction_id: transcation_id,
                    account_id: (token == null ? '': token.email),
                    checkin_date: checkin_date,
                    checkout_date:  checkout_date,
                    acquired_persons: acquired_persons,
                    persons_price: persons_price,
                    total_day_price: total_day_price,
                    total_price: total_price,
                    first_name: first_name,
                    last_name: last_name,
                    phone_number: phone_number,
                    email: email,
                    image_transaction: [],
                    transaction_date: transaction_date,
                    confirmation_date: transaction_date,
        
                    guest_member: guest_member,
                    confirmNot: 'true'
                } }).then(() => {
                    //Send mail to admin______________________________________________________________
                    new inboxes_column({
                        _id: _id,
                        usermail_id: '',
                        fullname: first_name+" "+last_name,
                        email: email,
                        reserved_email: 'Bot message',
                        numGuest: '',
                        contact_num: '',
                        message: `The reservation of the room has already have paid by the user using paypal as payment. Transaction ID: ${transcation_id}.`,
                        dateArrival: '',
                        timeDate: transaction_date,
                        favorite: false,
                        acceptedNot: 'new',
                        appointmentNot: 'reservation',
                        newNot: true,
                        folderName: 'inbox',
                        guest_member: '',
                        transaction_ID: ''
                    }).save().then(() => {
                        
                        //Send gmail to admin________________________________________________________
                        const message = `The reservation of the room has already have paid by the user using paypal as payment. Transaction ID: ${transcation_id}.`;
                        transporter.sendMail({
                            from: email,
                            to: process.env.USER_MAIL,
                            subject: 'Paid staycation room',
                            text: message
                        }, (err, info) => {});

                        res.json({ response: 'success'});

                    });
                });
            });
        }else{
            res.json({ response: 'have' });
        }
    }
});


//Middleware_user checking__________________________________________________________________
function middleware_user(req, res, next){
    try{
        let bearer = req.headers['authorization'];
        if(typeof bearer !== 'undefined'){
            var get_token = bearer.split(' ')[1];
            if(get_token === '' && get_token === ' ') res.sendStatus(401);
            jwt.verify(get_token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
                if(err){
                    res.token = null;
                    next();
                }else{
                    req.token = result;
                    next();
                }
            });

        }else{
            res.token = null;
            next();
        }
    }catch(err){
        res.token = null;
        next();
    }
}





//Get the "admin_user_reservation" data________________________________________________________________
router.post('/getReservation', middleware_user, async (req, res) => {
    const { skip, limit, radioCondition, searchingNot, searchString } = req.body;

    let count = null;
    
    let message = 'No query';
    let data = null;

    //Not searching____________________________________________________
    if(!searchingNot){
        switch(radioCondition){
            case 'all':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'new' }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'new'  })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                    
                message = 'No pending reservation request for now.';
            break;
            case 'accepted':
                count = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true'}] }).count();
                data = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true'}] })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);

                message = 'No accepted reservation ever recorded.';
            break;
            case 'declined':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false' }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false' })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);

                message = 'No declined reservation ever recorded.';
            break;
            case 'canceled':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'true false' }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'true false' })
                    .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                
                message = 'No canceled reservation ever recorded.';
            break;
            case 'trash':
                count = await reservation_column.find({ delete_admin: 'tempoDelete' }).count();
                data = await reservation_column.find({ delete_admin: 'tempoDelete' }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                message = 'Empty archive reservation.';
            break;
        }
    }

    //Searching____________________________________________________________
    if(searchingNot){
        switch(radioCondition){
            case 'all':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'new' , $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'new', $text: { $search: searchString  }}).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'accepted':
                count = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true'}], 
                    $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true'}], 
                    $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'declined':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false', $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false', $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'canceled':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'true false', $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'true false', $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'trash':
                count = await reservation_column.find({ delete_admin: 'tempoDelete', $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'tempoDelete', $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
        }
    }

    if(data.length > 0){    
        res.json({ response: 'success', data: data, count: count });
    }else{
        res.json({ response: message });
    }
});


//Accept and decline reservation request______________________________________________________________
router.post('/A-D_Request', middleware_admin, async (req, res) => {
    const { id, room_id, email_id, confirmation_date, condition } = req.body;

    let data_admin = await data_reg.findOne({ email: req.token.email });

    const data = await reservation_column.findOne({ _id: id, room_id: room_id, email_id: email_id });

    if(condition){
        const checking = await rooms_column.findOne({ _id: room_id});
        if(checking.confirmNot === 'false' && checking.delete_room === 'false'){
            reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: {
                confirmation_date: confirmation_date,
                confirmNot: 'true'
            } }).then(() => {
                rooms_column.updateOne({ _id: room_id }, { $set: {
                    paymentMethod: data.paymentMethod,
                    transaction_id: data.transaction_id,

                    account_id: email_id,
                    checkin_date: data.checkin_date,
                    checkout_date: data.checkout_date,
                    acquired_persons: data.acquired_persons,
                    persons_price: data.persons_price,
                    total_day_price: data.total_day_price,
                    total_price: data.total_price,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    phone_number: data.phone_number,
                    email: data.email,
                    image_transaction: data.image_transaction,
                    transaction_date: data.transaction_date,
                    confirmation_date: confirmation_date,

                    guest_member: data.guest_member,
                    confirmNot: 'true'
                } }).then(() => {

                    //send email to user that the admin accept the request__________________________________________
                    new notification_col({
                        email: email_id,
                        name: data_admin.fullName,
                        message: `Your reservation request has been accepted by the admin. Transaction ID: ${data.transaction_id}`,
                        date: confirmation_date,
                        deleteNot: 'new'
                    }).save().then(async () => {
                        
                        let data_check = await notification_click_col.findOne({ email: email_id });
                        let numbers = data_check.number+1;

                        notification_click_col.updateOne({ email: email_id },
                            { $set: { number: numbers, clicked: true } }).then(() => {

                            //send mail to the user_______________________________________
                            sendEmail(res, data.transaction_id, 'accepted', data.email)
                        });
                    }); 

                });
    
            });   
        }else{
            res.json({ response: checking.confirmNot === 'true' ? 'not':'deleted' });
        }        
    }else{
        reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: {
            confirmation_date: confirmation_date,
            confirmNot: 'false'
        } }).then(() => {

            //send email to user that the admin decline the request__________________________________________
            new notification_col({
                email: email_id,
                name: data_admin.fullName,
                message: `Your reservation request has been declined by the admin. Transaction ID: ${data.transaction_id}`,
                date: confirmation_date,
                deleteNot: 'new'
            }).save().then(async () => {
                
                let data_check = await notification_click_col.findOne({ email: email_id });
                let numbers = data_check.number+1;

                notification_click_col.updateOne({ email: email_id },
                    { $set: { number: numbers, clicked: true } }).then(() => {

                    //send mail to the user_______________________________________
                    sendEmail(res, data.transaction_id, 'declined', data.email)
                });
            }); 

        });
    }

});

//send email to user__________________________________________________________
function sendEmail(res, transaction_ID, condition, email){

    const message = `Your reservation request is ${condition} by the admin. Transaction ID: ${transaction_ID}.`

    transporter.sendMail({
        from: process.env.USER_MAIL,
        to: email,
        subject: 'Reservation message',
        text: message
    }, (err, info) => {});

    res.json({ response: 'success'});

}


//Canceling the reservation request____________________________________________________________
router.post('/cancelReservation', middleware_user, async (req, res) => {
    const { id, email_id, email, room_id, date, userNot, first_name, last_name } = req.body;
    let data_admin = await data_reg.findOne({ email: req.token.email });
    var _id = mongoose.Types.ObjectId();

    const data = await reservation_column.findOne({ _id: id, room_id: room_id, email_id: email_id });

    reservation_column.updateOne({ _id: id, email_id: email_id, room_id: room_id }, { $set: { confirmNot: 'true false' } }).then(() => {

        if(!userNot){
            rooms_column.updateOne({ _id: room_id, account_id: email_id }, { $set: {

                paymentMethod: '',
                account_id: '',
                checkin_date: '',
                checkout_date: '',
                acquired_persons: '',
                persons_price: '',
                total_day_price: '',
                total_price: '',
                first_name: '',
                last_name: '',
                phone_number: '',
                email: '',
                image_transaction: [],
                transaction_date: '',
                confirmation_date: '',
        
                confirmNot: 'false'
    
            } }).then(() => {
                    //Send email and notication to user_________________________________________________________________
                    new notification_col({
                        email: email_id,
                        name: data_admin.fullName,
                        message: `Your reservation request has been canceled by the admin. Transaction ID: ${data.transaction_id}`,
                        date: date,
                        deleteNot: 'new'
                    }).save().then(async () => {
                        
                        let data_check = await notification_click_col.findOne({ email: email_id });
                        let numbers = data_check.number+1;
    
                        notification_click_col.updateOne({ email: email_id },
                            { $set: { number: numbers, clicked: true } }).then(() => {
    
                            //send mail to the user_______________________________________
                            res.json({ response: 'success'});
                        });
                    });
            });
        }else{
            rooms_column.updateOne({ _id: room_id, account_id: email_id }, { $set: {

                paymentMethod: '',
                account_id: '',
                checkin_date: '',
                checkout_date: '',
                acquired_persons: '',
                persons_price: '',
                total_day_price: '',
                total_price: '',
                first_name: '',
                last_name: '',
                phone_number: '',
                email: '',
                image_transaction: [],
                transaction_date: '',
                confirmation_date: '',
        
                confirmNot: 'false'
    
            } }).then(() => {
                //Send mail to admin______________________________________________________________
                new inboxes_column({
                    _id: _id,
                    usermail_id: '',
                    fullname: first_name+" "+last_name,
                    email: email,
                    reserved_email: 'Bot message',
                    numGuest: '',
                    contact_num: '',
                    message: `The user is cancel the reservation. Transaction ID: ${data.transaction_id}`,
                    dateArrival: '',
                    timeDate: date,
                    favorite: false,
                    acceptedNot: 'new',
                    appointmentNot: 'cancel_reserv',
                    newNot: true,
                    folderName: 'inbox',
                    guest_member: '',
                    transaction_ID: ''
                }).save().then(() => {

                    //Send gmail to admin________________________________________________________
                    const message = `The user is cancel the reservation. Transaction ID: ${data.transaction_id}`;
                    transporter.sendMail({
                        from: email,
                        to: process.env.USER_MAIL,
                        subject: 'Reservation message',
                        text: message
                    }, (err, info) => {});

                    res.json({ response: 'success'});
                }); 
            });
        }
    });
});

//retrieve Reservation________________________________________________________________
router.post('/retrieve_Reservation', middleware_user, async (req, res) => {
    const { id, room_id, email_id } = req.body;
    if(req.token.adminNot === 'admin'){
        reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: { 
            delete_admin: 'false'
         } }).then(() => {
            res.json({ response: 'success' });
         });
    }else{
        reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: { 
            delete_user: 'false'
         } }).then(() => {
            res.json({ response: 'success' });
         });
    }
});


//Delete reservation temporary________________________________________________________
router.post('/deleteReservation_tempo', middleware_user, async (req, res) => {
    const { id, room_id, email_id } = req.body;
    if(req.token.adminNot === 'admin'){
        reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: { 
            delete_admin: 'tempoDelete'
         } }).then(() => {
            res.json({ response: 'success' });
         });
    }else{
        reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: { 
            delete_user: 'tempoDelete'
         } }).then(() => {
            res.json({ response: 'success' });
         });
    }
});


//Delete reservation checking____________________________________________________________
router.post('/deleteReservation', middleware_user, async (req, res) => {
    const { id, room_id, email_id } = req.body;

    let data = await reservation_column.findOne({ _id: id, room_id: room_id, email_id: email_id  });
    if(req.token.adminNot === 'admin'){
        if(data.delete_user !== 'deleted'){

            reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: { 
                delete_admin: 'deleted'
             } }).then(() => {
                res.json({ response: 'success' });
             });

        }else{
            if(data.image_transaction.length == 0){
                reservation_column.deleteOne({ _id: id, room_id: room_id, email_id: email_id }).then(() => {
                    res.json({ response: 'delete', img_arr: []});
                });
            }else{
                res.json({ response: 'delete', img_arr: data.image_transaction });
            }
        }
    }else{
        if(data.delete_admin !== 'deleted'){

            reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: { 
                delete_user: 'deleted'
             } }).then(() => {
                res.json({ response: 'success' });
             });

        }else{
            
            if(data.image_transaction.length == 0){
                reservation_column.deleteOne({ _id: id, room_id: room_id, email_id: email_id }).then(() => {
                    res.json({ response: 'delete', img_arr: []});
                });
            }else{
                res.json({ response: 'delete', img_arr: data.image_transaction });
            }
        }
    }

});

//Deleting room finally_______________________________________________________________________
router.post('/deleteReservation_final', (req, res) => {
    const { id, room_id, email_id } = req.body;

    reservation_column.deleteOne({ _id: id, room_id: room_id, email_id: email_id }).then(() => {
        res.json({ response: 'success'});
    });
});









//TEMPORARY________________________________________________________________________
router.get('/temporary', (req, res) => {
    rooms_column.updateOne({ _id: "63637a57387d39f61029eb8e" }, { $set: {
        paymentMethod: "",
        account_id: "",
        checkin_date: "",
        checkout_date: "",
        acquired_persons: "",
        persons_price: "",
        total_day_price: "",
        total_price: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        image_transaction: [],
        transaction_date: "",
        confirmation_date: "",

        confirmNot: 'false'
    } }).then(() => {
        res.json({ response: 'success' });
    });
});


router.get('/asdasd', (req, res) => {
    reservation_column.updateOne({ _id: "6326d7d96cc926c55887003f", room_id: "6328213725ead403fd2ab39f", email_id: "kylevelarde374@gmail.com" }, 
    { $set: { 
        image_transaction: [["https://res.cloudinary.com/dutfzeatp/image/upload/v1663492751/andrew-haimerl-andrewnef-ZGKu75Ewnwo-unsplash_efg1ll.jpg",
                            "andrew-haimerl-andrewnef-ZGKu75Ewnwo-unsplash_efg1ll"]]
     } }).then(() => {
        res.json({ response: 'success' });
    });
});



module.exports = router;