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
router.post('/uploadImage', async (req, res) => {
    try {
        upload(req,res, async function(err){
            if (err instanceof multer.MulterError) {
                res.sendStatus(504);
            }else if(err) {
                res.sendStatus(504);
            }

            const result = await cloudinary.uploader.upload(req.file.path);
            res.json({ response: 'success', data: { avatar: result.secure_url, cloudinary_id: result.public_id} });
        });
    }catch(err){
        res.json({ response: err });
    }
});


//Create new Room____________________________________________________________________________________
router.post('/createNewRoom', (req, res) => {

    const { nameRoom, addInfo, defaultPrice, goodPersons, pricePersons, typeRoom, typeRoom2, imgArr } = req.body;
    new rooms_column({
        nameRoom: nameRoom,
        addInfo: addInfo,
        defaultPrice: defaultPrice,
        goodPersons: goodPersons,
        pricePersons: pricePersons,
        typeRoom: typeRoom,
        typeRoom2: typeRoom2,
        imgArr: imgArr,

        paymentMethod: '',
        transaction_id: '',
        
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
        
        guest_member: '',
        confirmNot: 'false',
        delete_room: 'false'
    }).save().then(() => {
        res.json({ response: 'success' });
    });

});


//Getting room_____________________________________________________________________________________
router.post('/getRooms', middleware_admin, async (req, res) => {

    const { condition, serviceSelectedCall, roomSelectedCall } = req.body;
    let datas = [];
    let tempo = null;

    if(condition){
        if(serviceSelectedCall === 'All' && roomSelectedCall === 'All'){
            tempo = await rooms_column.count({ delete_room: 'false'});
            datas = await rooms_column.find({ delete_room: 'false'}).sort({ createdAt: 'descending' });   
        }else if(serviceSelectedCall === 'All'){
            tempo = await rooms_column.count({ delete_room: 'false', typeRoom2: roomSelectedCall});
            datas = await rooms_column.find({ delete_room: 'false', typeRoom2: roomSelectedCall}).sort({ createdAt: 'descending' });
        }else if(roomSelectedCall === 'All'){
            tempo = await rooms_column.count({ delete_room: 'false', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true )});
            datas = await rooms_column.find({ delete_room: 'false', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true )}).sort({ createdAt: 'descending' });
        }else{
            tempo = await rooms_column.count({ delete_room: 'false', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true ), typeRoom2: roomSelectedCall, });
            datas = await rooms_column.find({ delete_room: 'false', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true ), typeRoom2: roomSelectedCall, }).sort({ createdAt: 'descending' });   
        }
    }else{
        tempo = await rooms_column.count({ delete_room: 'false'});
        if(tempo < 2){
            datas = await rooms_column.find({ delete_room: 'false'}).sort({ createdAt: 'descending' }).skip(0).limit(2);
        }else{
            datas = await rooms_column.find({ delete_room: 'false'}).sort({ createdAt: -1 }).skip(0).limit(2);
        }
    }
    if(datas.length > 0){
        res.json({ response: 'success', data: datas, count: tempo });
    }else{
        res.json({ response: 'not-have' });
    }

});


//Getting deleted room________________________________________________________________________________________
router.post('/getdeleteRoom', middleware_admin, async (req, res) => {
    const { serviceSelectedCall, roomSelectedCall } = req.body;

    let datas = null;

    if(serviceSelectedCall === 'All' && roomSelectedCall === 'All'){
        datas = await rooms_column.find({ delete_room: 'true'}).sort({ createdAt: 'descending' });   
    }else if(serviceSelectedCall === 'All'){
        datas = await rooms_column.find({ delete_room: 'true', typeRoom2: roomSelectedCall}).sort({ createdAt: 'descending' });
    }else if(roomSelectedCall === 'All'){
        datas = await rooms_column.find({ delete_room: 'true', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true )}).sort({ createdAt: 'descending' });
    }else{
        datas = await rooms_column.find({ delete_room: 'true', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true ), typeRoom2: roomSelectedCall }).sort({ createdAt: 'descending' });   
    }

    if(datas.length > 0){
        res.json({ response: 'success', data: datas });
    }else{
        res.json({ response: 'not-have' });
    }
});

//Getting room to show to landing page____________________________________________________________________
router.get('/getRoomLanding', async (req, res) => {
    const count = await rooms_column.count({ delete_room: 'false'});
    const data = await rooms_column.find({ delete_room: 'false'}).sort( { createdAt: -1 } ).skip(0).limit(2);
    if(data.length > 0){
        let arr_room = [];
        for await(let room of data){
            arr_room.push([room.imgArr[0][0], room.nameRoom]);
        }

        res.json({ response: 'success', data: arr_room, count: count });
    }else{
        res.json({ response: 'no-data' });
    }
});

//Getting all rooms to show to landing page______________________________________________________________
router.post('/getRoomAll', async (req, res) => {
    const { serviceSelectedCall, roomSelectedCall } = req.body;
    const jsData = { _id: 1, nameRoom: 1, addInfo: 1, defaultPrice: 1, goodPersons: 1, pricePersons: 1, typeRoom: 1, typeRoom2: 1, imgArr: 1, confirmNot: 1};

    let datas = null;
    let rooms_DataF = await rooms_column.find({ delete_room: 'false'}, jsData).sort({ createdAt: 'descending' });  

    if(serviceSelectedCall === 'All' && roomSelectedCall === 'All'){
        datas = await rooms_column.find({ delete_room: 'false'}, jsData).sort({ createdAt: 'descending' });   
    }else if(serviceSelectedCall === 'All'){
        datas = await rooms_column.find({ delete_room: 'false', typeRoom2: roomSelectedCall}, jsData).sort({ createdAt: 'descending' });
    }else if(roomSelectedCall === 'All'){
        datas = await rooms_column.find({ delete_room: 'false', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true )}, jsData).sort({ createdAt: 'descending' });
    }else{
        datas = await rooms_column.find({ delete_room: 'false', typeRoom: ( serviceSelectedCall === 'Rental' ? false: true ), typeRoom2: roomSelectedCall}, jsData).sort({ createdAt: 'descending' });   
    }

    if(datas.length > 0 || rooms_DataF.length > 0){
        res.json({ response: 'success', data: datas, rooms_DataF: rooms_DataF });
    }else{
        res.json({ response: 'no-data' }); 
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


//Move to trash___________________________________________________________________________
router.post('/moveToTrash', middleware_admin, (req , res) => {
    const { _id } = req.body;

    rooms_column.updateOne({ _id: _id }, { $set: { delete_room: 'true' } }).then(() => {
        res.json({ response: 'success' });
    });

});

router.post('/room_retreive', middleware_admin, async (req, res) => {
    const { _id } = req.body;

    rooms_column.updateOne({ _id: _id }, { $set: { delete_room: 'false' } }).then(() => {
        res.json({ response: 'success' });
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