require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const data_login = require('../databases/logReg_column')("login_accounts");
const room_col = require('../databases/rooms_column')('admin_rooms');

const rooms_db = require('../databases/rooms_column');
const rooms_column = rooms_db('admin_rooms');



//Checking if user is login token____________________________________________________
const middleware_user = require('./authorization');
router.get('/checking_login', middleware_user, (req, res) => {
    res.json({ response: 'success' });
}); 




//Creating jwt token for payment reserve__________________________________________________________________
function middleware_serve(req, res, next){
    const auth = req.headers['authorization'];
    if(typeof auth !== 'undefined'){
        const token = auth.split(' ')[1];
        if(token !== ''){
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
                if(err) {
                    req.token = null;
                    next();
                }else{
                    data_login.findOne({ email: result.email }).then((dataRest) => {
                        if(dataRest != null){
                            if(dataRest.admin === 'not-admin'){
                                req.token = result;
                                next();
                            }else{
                                req.token = null;
                                next();
                            }
                        }else{
                            req.token = null;
                            next();
                        }
                    }); 
                }
                
            });
        }else{
            req.token = null;
            next();
        }
    }else{
        req.token = null;
        next();
    }
}

//Database token payment_________________________________________________________________
const mongoose = require('mongoose');
const schema = mongoose.Schema;

function db_token_payment(){
    let models = null;
    if(mongoose.models['token_payment']){
        models = mongoose.models['token_payment'];
    }else{
        models = mongoose.model('token_payment', new schema({
            token_payment: { type: String, required: true }
        }));
    }

    return models;
}

//Creating token for payment___________________________________________________
router.post('/createJwt_payment', middleware_serve, (req, res) => {

    let datas = null;
    if(req.token != null){
        datas = {
            checkIn: req.body.data.checkIn,
            checkOut: req.body.data.checkOut,
            personsCount: req.body.data.personsCount,
            room_sh: req.body.data.room_sh,
            email: req.token.email
        };
    }else{
        datas = req.body.data;
    }

    var token = jwt.sign(datas, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h'});
    
    new db_token_payment()({
        token_payment: token
    }).save().then(() => {
        res.json({ data: token, _ds: req.token != null});
    });
});


//Checking the token payment____________________________________________________________________________
router.post('/checkingToken_payment', (req, res) =>{
    jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
        const data = await db_token_payment().findOne({ token_payment: req.body.token });

        if(err){
            db_token_payment().deleteOne({ token_payment: req.body.token }).then(() => {
                res.json({ response: 'expired' });
            });
        }else{

            if(data != null){
                res.json({ response: 'success', data: result });
            }else{
                res.json({ response: 'expired' });
            }
        }
    });
});


//Room availability_______________________________________________________________________________________
router.post('/roomAvailability', async (req, res) => {
    const { _id, token } = req.body;
    const data = await rooms_column.findOne({ _id: _id, confirmNot: 'false' });

    if(data != null){
        res.json({ response: 'success' });
    }else{
        await db_token_payment().deleteOne({ token_payment: token });
        res.json({ response: 'have' });
    }

});


//Get room selected___________________________________________________________________________________
router.post('/getRoom_payment', async (req, res) => {
    const { _id } = req.body;

    const data = await room_col.findOne({ _id: _id });

    if(data.confirmNot === 'false'){
        res.json({ response: 'success', data: {nameRoom: data.nameRoom, img_first: data.imgArr[0][0],
            defaultPrice: data.defaultPrice, goodPersons: data.goodPersons, pricePersons: data.pricePersons, typeRoom2: data.typeRoom2 }});
    }else{
        res.json({ response: 'already' });
    }

});


//Deleting session token_________________________________________________________________________________
router.post('/delete_session', async (req, res) => {
    const { token } = req.body;
    await db_token_payment().deleteOne({ token_payment: token });
    res.json({ response: 'success' });
});


module.exports = router;