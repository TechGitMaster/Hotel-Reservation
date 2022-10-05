require('dotenv').config();
const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary');
const multer = require('multer');
const path = require('path');

const middleware_user = require('./authorization');

const rooms_db = require('../databases/rooms_column');
const reservation_column = rooms_db('admin_user_reservation');

//Cloudinary and Multer________________________________________________

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: 916367643684954,
    api_secret: process.env.API_SECRET
});

const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        
        if(ext === '.jpg' || ext === '.jpeg' || ext === '.png'){
            cb(null, true);
        }else{
            cb(null, false);
        }
    }, limits: { fieldSize: 10 * 1024 * 1024 }
}).array('images');

//_________________________________________________



//UPLOAD IMAGE TO CLOUDINARY___________________________________________________________
router.post('/uploadImage_reservation', async (req, res) => {
    try {
        let arr_data = [];
        upload(req,res, async function(err){
            if (err instanceof multer.MulterError) {
                res.sendStatus(504);
            }else if(err) {
                res.sendStatus(504);
            }

            for await (let file of req.files){
                const result = await cloudinary.uploader.upload(file.path);
                arr_data.push([result.secure_url, result.public_id]);
            }

           res.json({ response: 'success', data: arr_data });
        });
    }catch(err){
        res.json({ response: err });
    }
});




//Update the reservation Image____________________________________________________________
router.post('/updateReservation', (req, res) => {
    const { id, room_id, email_id, arr_img } = req.body;
    reservation_column.updateOne({ _id: id, room_id: room_id, email_id: email_id }, { $set: { image_transaction: arr_img } }).then(() => {
        res.json({ response: 'success'});
    });
});


//Get the "admin_user_reservation" data________________________________________________________________
router.post('/getReservation_user', middleware_user, async (req, res) => {
    const { skip, limit, radioCondition } = req.body;

    let count = null;
    
    let message = 'No query';
    let data = null;

    switch(radioCondition){
        case 'all':
            count = await reservation_column.find({ delete_user: 'false', confirmNot: 'new' }).count();
            data = await reservation_column.find({ delete_user: 'false', confirmNot: 'new'  })
                .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
                
            message = 'No pending reservation request for now.';
        break;
        case 'accepted':
            count = await reservation_column.find({ delete_user: 'false', $or: [{confirmNot: 'true'}] }).count();
            data = await reservation_column.find({ delete_user: 'false', $or: [{confirmNot: 'true'}] })
                .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);

            message = 'No accepted reservation ever recorded.';
        break;
        case 'declined':
            count = await reservation_column.find({ delete_user: 'false', confirmNot: 'false' }).count();
            data = await reservation_column.find({ delete_user: 'false', confirmNot: 'false' })
                .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);

            message = 'No declined reservation ever recorded.';
        break;
        case 'canceled':
            count = await reservation_column.find({ delete_user: 'false', confirmNot: 'true false' }).count();
            data = await reservation_column.find({ delete_user: 'false', confirmNot: 'true false' })
                .sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            
            message = 'No canceled reservation ever recorded.';
        break;
        case 'trash':
            count = await reservation_column.find({ delete_user: 'tempoDelete' }).count();
            data = await reservation_column.find({ delete_user: 'tempoDelete' }).sort( { createdAt: 'descending' } ).skip(skip).limit(limit);
            message = 'No deleted reservation ever recorded.';
        break;
    }

    if(data.length > 0){    
        res.json({ response: 'success', data: data, count: count });
    }else{
        res.json({ response: message });
    }
});



module.exports = router;