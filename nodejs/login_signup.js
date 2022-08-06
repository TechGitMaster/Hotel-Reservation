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

    var { firstname, lastname, username, contactnumber, email, password, gender } = req.body;
    
    var passwordcryptoJS = await cryptojs.AES.encrypt(password, process.env.PASSWORD_SECRET_KEY);
    var passwordHash = await bcryptjs.hash(password, 10);

    //registration save data_________________________________________________
    new data_registration({  
        firstname: firstname,
        lastname: lastname,
        username: username,
        contactnumber: contactnumber,
        email: email,
        password: passwordHash,
        passwordSecond: passwordcryptoJS,
        gender: gender,
    }).save()
    .then(() => {

        new data_login({
            username: username,
            password: passwordHash
        }).save().then(() => {


            res.json({ condition: 'Success creating account' });


        }).catch((err) => console.log(err)); 

    })
    .catch((err) => console.log(err));
});

//LOGIN___________________________________________________________________
router.post('/login', async (req, res) => {

    var { username, password } = req.body;

    var data = await data_login.findOne({ username: username });
    if(data == null){res.json({token: '', response: 'no-data'})
    }else{
        bcryptjs.compare(password, data.password).then((ress) => {
            if(!ress) {res.json({token: '', response: 'wrong-password'})}else{
                var token = jwt.sign( { username: data.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'});
                res.json({tokens: token, response: 'success'});
            }
        });
    }

});


//checking token_______________________________________________________________________
router.get('/checking_token_refresh/:hello', middleware, async (req, res) => {
    var hel = req.params.hello;
    var data = await data_login.findOne({ username: req.token.username });
    
    if(data != null){
        res.json({ response: 'success', data: hel });
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