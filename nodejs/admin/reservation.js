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




//Save reservation request made by user___________________________________________________
router.post('/saveReservation', middleware_user, async (req, res) => {
    const { room_id, checkin_date, checkout_date, acquired_persons, persons_price, total_day_price, total_price, first_name,
        last_name, phone_number, email, image_transaction, transaction_date, paymentMethod} = req.body.data;
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
                
                if(condition){
        
                    const roomdata = await rooms_column.findOne({ _id: room_id });
                    let room_img = roomdata.imgArr[0];
                    let room_name = roomdata.nameRoom;
            
                    new reservation_column({
                        room_id: room_id,
                        email_id: token.email,
            
                        img_room: room_img,
                        name_room: room_name,
                        
                        defaultPrice: roomdata.defaultPrice,
                        paymentMethod: paymentMethod,
        
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
                        
                        confirmNot: 'new',
            
                        delete_admin: 'false',
                        delete_user: 'false'
                    }).save().then(() => {
            
                        //Send mail to admin______________________________________________________________
                        new inboxes_column({
                            _id: _id,
                            fullname: first_name+" "+last_name,
                            email: email,
                            reserved_email: 'Bot message',
                            numGuest: '',
                            contact_num: '',
                            message: 'New reservation request. Must check it out on "Reservations component".',
                            dateArrival: '',
                            timeDate: transaction_date,
                            favorite: false,
                            acceptedNot: 'new',
                            appointmentNot: 'reservation',
                            newNot: true,
                            folderName: 'inbox'
                        }).save().then(() => {
                            res.json({ response: 'success' });
                        });
                    });
                }else{
                    res.json({ 'response': 'have' });
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
                
                defaultPrice: roomdata.defaultPrice,
                paymentMethod: paymentMethod,

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
                
                confirmNot: 'true',

                delete_admin: 'false',
                delete_user: 'false'
            }).save().then(() => {

                //Update the room already reserved_______________________________________________________
                rooms_column.updateOne({ _id: room_id }, { $set: {
                    paymentMethod: paymentMethod,
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
        
                    confirmNot: 'true'
                } }).then(() => {
                    //Send mail to admin______________________________________________________________
                    new inboxes_column({
                        _id: _id,
                        fullname: first_name+" "+last_name,
                        email: email,
                        reserved_email: 'Bot message',
                        numGuest: '',
                        contact_num: '',
                        message: `The room already have paid by the user. To see the details, check it to "Reservation component".`,
                        dateArrival: '',
                        timeDate: transaction_date,
                        favorite: false,
                        acceptedNot: 'new',
                        appointmentNot: 'reservation',
                        newNot: true,
                        folderName: 'inbox'
                    }).save().then(() => {
                        res.json({ response: 'success' });
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
router.post('/getReservation', middleware_admin, async (req, res) => {
    const { skip, limit, radioCondition, searchingNot, searchString } = req.body;

    let count = null;
    
    let message = 'No query';
    let data = null;

    //Not searching____________________________________________________
    if(!searchingNot){
        switch(radioCondition){
            case 'all':
                count = await reservation_column.find({ delete_admin: 'false' }).count();
                data = await reservation_column.find({ delete_admin: 'false' }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                message = 'No reservation request right now.';
            break;
            case 'accepted':
                count = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true false'}, {confirmNot: 'true'}] }).count();
                data = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true false'}, {confirmNot: 'true'}] }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                message = 'No accepted reservation ever recorded.';
            break;
            case 'declined':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false' }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false' }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                message = 'No declined reservation ever recorded.';
            break;
            case 'trash':
                count = await reservation_column.find({ delete_admin: 'tempoDelete' }).count();
                data = await reservation_column.find({ delete_admin: 'tempoDelete' }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                message = 'No delete reservation ever recorded.';
            break;
        }
    }

    //Searching____________________________________________________________
    if(searchingNot){
        switch(radioCondition){
            case 'all':
                count = await reservation_column.find({ delete_admin: 'false', $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'false', $text: { $search: searchString  }}).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'accepted':
                count = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true false'}, {confirmNot: 'true'}], 
                    $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'false', $or: [{confirmNot: 'true false'}, {confirmNot: 'true'}], 
                    $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            break;
            case 'declined':
                count = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false', $text: { $search: searchString  } }).count();
                data = await reservation_column.find({ delete_admin: 'false', confirmNot: 'false', $text: { $search: searchString  } }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
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
    
    if(condition){
        const checking = await rooms_column.findOne({ _id: room_id});
        const data = await reservation_column.findOne({ _id: id, room_id: room_id, email_id: email_id });
        if(checking.confirmNot === 'false' && checking.delete_room === 'false'){
            reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: {
                confirmation_date: confirmation_date,
                confirmNot: 'true'
            } }).then(() => {
                rooms_column.updateOne({ _id: room_id }, { $set: {
                    paymentMethod: data.paymentMethod,
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
    
                    confirmNot: 'true'
                } }).then(() => {
                    //send email to user that the admin accept the request__________________________________________
                    res.json({ response: 'success' });
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
            res.json({ response: 'success' });
        });
    }

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
            res.json({ response: 'delete', img_arr: data.image_transaction });
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


//Canceling the reservation request____________________________________________________________
router.post('/cancelReservation', middleware_user, async (req, res) => {
    const { id, email_id, room_id } = req.body;
    reservation_column.updateOne({ _id: id, email_id: email_id, room_id: room_id }, { $set: { confirmNot: 'true false' } }).then(() => {
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
            res.json({ response: 'success' });

        });
    });
});









//TEMPORARY________________________________________________________________________
router.get('/temporary', (req, res) => {
    rooms_column.updateOne({ _id: "630f47884480b80261a68636" }, { $set: {
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
        //send email to user that the admin accept the request__________________________________________
        res.json({ response: 'success' });
    });
});


router.get('/asdasd', (req, res) => {
    reservation_column.updateOne({ _id: "631978942d5e311118a8aa29", room_id: "630f47884480b80261a68636", email_id: "royvelarde0910@gmail.com" }, 
    { $set: { 
        image_transaction: [["https://res.cloudinary.com/dutfzeatp/image/upload/v1662199109/andrew-haimerl-andrewnef-ZGKu75Ewnwo-unsplash_ggkklp.jpg",
                            "andrew-haimerl-andrewnef-ZGKu75Ewnwo-unsplash_ggkklp"]]
     } }).then(() => {
        res.json({ response: 'success' });
    });
});



module.exports = router;