require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary');
const multer = require('multer');
const path = require('path');
const middleware_admin = require('./authorization');

const router = express.Router();
const room_schemas = require('../databases/rooms_column');
const rooms_column = room_schemas('admin_rooms');


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
}).single('image');

//_________________________________________________



//UPLOAD IMAGE TO CLOUDINARY and... return the id of that image from cloudinary___________________________________________________________
router.post('/uploadImage', middleware_admin, async (req, res) => {
    try {
        upload(req,res, async function(err){
            if (err instanceof multer.MulterError) {
                console.log(err);
                res.sendStatus(504);
            }else if(err) {
                console.log(err);
                res.sendStatus(504);
            }

            const result = await cloudinary.uploader.upload(req.file.path);
            res.json({ response: 'success', data: { avatar: result.secure_url, cloudinary_id: result.public_id} });
        });
    }catch(err){
        res.json({ response: error });
        throw err;
    }
});


//Create new Room____________________________________________________________________________________
router.post('/createNewRoom', middleware_admin, (req, res) => {

    const { nameRoom, addInfo, defaultPrice, goodPersons, pricePersons, typeRoom, imgArr } = req.body;
    new rooms_column({
        nameRoom: nameRoom,
        addInfo: addInfo,
        defaultPrice: defaultPrice,
        goodPersons: goodPersons,
        pricePersons: pricePersons,
        typeRoom: typeRoom,
        imgArr: imgArr,

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

        confirmNot: false,
    }).save().then(() => {
        res.json({ response: 'success' });
    });

});


//Getting room_____________________________________________________________________________________
router.post('/getRooms', middleware_admin, async (req, res) => {

    const { condition } = req.body;
    let datas = [];
    let tempo = await rooms_column.count();

    if(condition){
        datas = await rooms_column.find().sort({ createdAt: 'descending' });
    }else{
        if(tempo < 2){
            datas = await rooms_column.find().sort({ createdAt: 'descending' }).skip(0).limit(2);
        }else{
            datas = await rooms_column.find().sort({ createdAt: -1 }).skip(0).limit(2);
        }
    }
    if(datas.length > 0){
        res.json({ response: 'success', data: datas, count: tempo });
    }else{
        res.json({ response: 'not-have' });
    }

});

//Delete image and update room______________________________________________________________________________________________
router.post('/deleteImage', async (req, res) => {
    const { id_img } = req.body;
    try{
        await cloudinary.uploader.destroy(id_img);
        res.json({ response: 'success' });
    }catch(err){
        console.log(err);
        res.json({ response: 'success' });
    }
});

//Update room details_____________________________________________________________________________________________________________
router.post('/updateDetailsRoom', (req, res) => {
    const { id, nameRoom, addInfo, defaultPrice, goodPersons, pricePersons, imgArr } = req.body;

    rooms_column.updateOne({ _id:id }, { $set: {
        nameRoom: nameRoom,
        addInfo: addInfo,
        defaultPrice: defaultPrice,
        goodPersons: goodPersons,
        pricePersons: pricePersons,
        imgArr: imgArr,
    } }).then(async () => {

        let data = await rooms_column.findOne({ _id: id });

        res.json({ response: 'success', data: data });
    });

});


//Delete room finally________________________________________________________________________________________
router.post('/deleteRoom', (req, res) => {
    const { _id } = req.body;
    rooms_column.deleteOne({ _id:_id }).then(() => {
        res.json({ response: 'success' });
    });
}); 



module.exports = router;