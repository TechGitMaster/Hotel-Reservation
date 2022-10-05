const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');

const middleware = require('./authorization');

const notification_db = require('../databases/notification_column');
const notification_col = notification_db('user_notification');

const appointment_db = require('../databases/inboxes_user_column');
const appointment_col = appointment_db('user_pending_mail');

const rooms_db = require('../databases/rooms_column');
const reservation_column = rooms_db('admin_user_reservation');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: 916367643684954,
    api_secret: process.env.API_SECRET
});

//Get data of notification, appointment and reservation_____________________________________________________________
router.post('/get_dataArchive', middleware, async (req, res) => {
    const { skip, limit, radioCondition } = req.body;

    let count = 0;
    let data = [];
    let message = '';

    switch(radioCondition){
        case "notification":
            count = await notification_col.find({ deleteNot: 'delete' }).count();
            data = await notification_col.find({ deleteNot: 'delete' }).sort({ createdAt: -1 }).skip(skip).limit(limit);
            message = 'No deleted notification recorded.';
        break;
        
        case "appointment":
            count = await appointment_col.find({ deleteNot: true }).count();
            data = await appointment_col.find({ deleteNot: true }).sort({ createdAt: -1 }).skip(skip).limit(limit);
            message = 'No deleted appointment request recorded.';
        break;

        case "reservation":
            count = await reservation_column.find({ delete_user: 'tempoDelete' }).count();
            data = await reservation_column.find({ delete_user: 'tempoDelete' }).sort({ createdAt: -1 }).skip(skip).limit(limit);
            message = 'No deleted reservation request recorded.';
        break;
    }

    if(data.length > 0){
        res.json({ response: 'success', data: data, count: count });
    }else{
        res.json({ response: 'no-data', message: message });
    }
});



//Retrieve data____________________________________________________________________________________
router.post('/retrieve_data', middleware, async (req, res) => {
    const { _id, radioCondition } = req.body;

    switch(radioCondition){
        case 'notification':
            await notification_col.updateOne({ _id: _id }, { $set: { deleteNot: 'new' } });
        break;
        
        case 'appointment':
            await appointment_col.updateOne({ _id: _id }, { $set: { deleteNot: false } });
        break;

        case 'reservation':
            await reservation_column.updateOne({ _id: _id }, { $set: { delete_user: 'false' } });
        break;
    }

    res.json({ response: 'success' });
});


//Delete finally the data except "reservation"____________________________________________________________
router.post('/delete_dataFinally', middleware, async (req, res) => {
    const { _id, radioCondition } = req.body;

    switch(radioCondition){
        case 'notification':
            await notification_col.deleteOne({ _id: _id });
        break;
        
        case 'appointment':
            await appointment_col.deleteOne({ _id: _id });
        break;
    }

    res.json({ response: 'success' });
});



//Delete finally image of reservation__________________________________________________________________________
router.post('/deleteImage_user', async (req, res) => {
    const { img_arr } = req.body;
    try{
        for await(let data of img_arr){
            await cloudinary.uploader.destroy(data[1]);
        }
        res.json({ response: 'success' });
    }catch(err){
        console.log(err);
        res.json({ response: 'success' });
    }
});


module.exports = router;