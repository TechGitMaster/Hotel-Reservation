require('dotenv').config();
const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const cryptojs = require("crypto-js");
const database_column = require('./databases/database_column');

//Column db_______________________________________________________________
var data_registration = database_column('registered_accounts');
var data_login = database_column("login_accounts");



//REGISTRATION___________________________________________________________________
router.post('/registration', async (req, res) => {

    var { firstname, lastname, contact_number, email, password, gender } = req.body.data;
    
    var passwordcryptoJS = await cryptojs.AES.encrypt(password, process.env.PASSWORD_SECRET_KEY);
    var passwordHash = await bcryptjs.hash(password, 10);

    //registration save data_________________________________________________
    new data_registration({  
        firstname: firstname,
        lastname: lastname,
        contactnumber: contact_number,
        email: email,
        password: passwordHash,
        passwordSecond: passwordcryptoJS,
        gender: gender,
    }).save()
    .then(() => {

        new data_login({
            email: email,
            password: passwordHash
        }).save().then(() => {


            res.json({ response: 'Success creating account' });


        }).catch((err) => res.sendStatus(403)); 

    })
    .catch((err) => res.sendStatus(403));
});

//LOGIN___________________________________________________________________
router.post('/login', async (req, res) => {

    var { email, password } = req.body.data;

    var data = await data_login.findOne({ email: email });
    if(data == null){
        res.json({token: '', response: 'no-data'})
    }else{
        bcryptjs.compare(password, data.password).then((ress) => {
            if(!ress) {
                res.json({token: '', response: 'wrong-password'})
            }else{
                var token = jwt.sign( { email: data.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'});
                res.json({tokens: token, response: 'success'});
            }
        });
    }

});

//checking username if already exist_____________________________________________________
router.get('/emailCheck', async (req, res) => {
    var data = await data_login.findOne({ email: req.query.email });
    if(data == null){
        res.json({ response: 'no-data' });
    }else{
        res.json({ response: 'have-data' });
    }
});


//checking token_______________________________________________________________________
router.get('/checking_token_refresh', middleware, async (req, res) => {
    var data = await data_login.findOne({ username: req.token.email });
    
    if(data != null){
        res.json({ response: 'success' });
    }else{
        res.json({ response: 'no-data' });
    }
});


//Middleware checking__________________________________________________________________
function middleware(req, res, next){
    var bearer = req.headers['authorization'];
    if(typeof bearer !== 'undefined'){
        var get_token = bearer.split(' ')[1];
        if(get_token === '' && get_token === ' ') res.sendStatus(401);

        jwt.verify(get_token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
            if(err) res.sendStatus(401);
            req.token = result;
            next();
        });

    }else{
        res.sendStatus(403);
    }
}


module.exports = router;