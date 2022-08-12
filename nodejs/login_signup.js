require('dotenv').config();
const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const database_column = require('./databases/database_column');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

//Column db_______________________________________________________________
var data_registration = database_column('registered_accounts');
var data_login = database_column("login_accounts");

// set encryption algorithm
const algorithm = 'aes-256-cbc'

//REGISTRATION___________________________________________________________________
router.post('/registration', async (req, res) => {

    var { firstname, lastname, contact_number, email, password, gender } = req.body.data;
    var condition = req.body.condition;
    var fullname = req.body.fullName;
    var adminNot = req.body.adminNot;
    
    var jsonEncrypt = await encryptData(password);

    //registration save data_________________________________________________
    new data_registration({  
        firstname: firstname,
        lastname: lastname,
        fullName: firstname !== '' ? (firstname+' '+lastname): fullname,
        contactnumber: contact_number,
        email: email,
        password: jsonEncrypt.password,
        iv: jsonEncrypt.iv,
        gender: gender,
    }).save()
    .then(() => {
        new data_login({
            email: email,
            password: jsonEncrypt.password,
            iv: jsonEncrypt.iv,
            admin: adminNot,
            OTP_code: ''
        }).save().then(() => {
            
            if(condition === 'gmail-register'){
                
                var token = jwt.sign({ email: email, adminNot: adminNot }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'});
                res.json({ tokens: token, response: 'Success creating account' });

            }else{
                res.json({ tokens: '', response: 'Success creating account' });
            }


        }).catch((err) => {console.log(err); res.sendStatus(403) }); 

    })
    .catch((err) => {console.log(err); res.sendStatus(403) });
});

//LOGIN___________________________________________________________________
router.post('/login', async (req, res) => {

    var { email, password } = req.body.data;
    var condition = req.body.condition;

    var data = await data_login.findOne({ email: email });
    if(condition === 'norms-login'){
        if(data == null){
            res.json({token: '', response: 'no-data'})
        }else{
            var decryptPass = await decryptData(data.iv, data.password);

            if(decryptPass.password !== password){
                res.json({token: '', response: 'wrong-password'})
            }else{
                var token = jwt.sign( { email: data.email, adminNot: data.admin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'});
                res.json({tokens: token, response: 'success'});
            };
        }
    }else{
        var token = jwt.sign({ email: data.email, adminNot: data.admin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'});
        res.json({tokens: token, response: 'success'});
    }

});

//checking email if already exist_____________________________________________________
router.get('/emailCheck', async (req, res) => {
    var data = await data_login.findOne({ email: req.query.email });
    if(data == null){
        res.json({ response: 'no-data' });
    }else{
        res.json({ response: 'have-data' });
    }
});


//checking if admin password is correct_________________________________________________
router.post('/checkingAdminPassword', async (req, res) => {

    var { adminPassword } = req.body;
    
    var data = await data_login.find({ admin: 'admin' });

    var count = 0;
    for await (let dataFinal of data){
        var decryptPass = await decryptData(dataFinal.iv, dataFinal.password);
        
        if(decryptPass.password === adminPassword){
            res.json({ response: 'success' });
            break;
        }else{
            if(count == (data.length - 1)){
                res.json({ response: 'no' });
            }
        }
        count++;
    }

});




//Forgot password, means the user want to change the password_______________________________________________

//Mail OTP_____________________________________________
router.post('/forgotPasswordMail', async (req, res) => {

    const { to } = req.body;
    const arrCount = ['', '', '', '', '', ''];
    let code = '';

    arrCount.forEach((data) => {
        code += Math.floor(Math.random() * 9);
    });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.PASSWORD_MAIL
        }
    });

    const mailOptions = {
        from: process.env.USER_MAIL,
        to: to,
        subject: 'OTP Code number',
        text: `${code} is your OTP verification code.`
    };


    const data = await data_login.findOne({ email: to });

    if(data != null){
        transporter.sendMail(mailOptions, (err, info) => {
            data_login.findOneAndUpdate({ email: to }, { $set: { OTP_code: code } }, { new: true }, (err, result) => {
                if(!err){
                    res.json({ response: 'success' });
                }else{
                    res.sendStatus(403);
                }
            });
        });
    }else{
        res.json({ response: 'no-data' });
    }
});


//Checking the OTP code________________________________________________________________________________
router.get('/otpCode', async ( req, res ) => {
    const { email, otp_code } = req.query;

    const data_query = await data_login.findOne({ email: email }); 

    if(data_query == null){
        res.json({ response: 'no-data' });
    }else{
        if(otp_code === data_query.OTP_code){
            res.json({ response: 'success' });
        }else{
            res.json({ response: 'incorrect' });
        }
    }

});




//Change Password__________________________________________________________________________________________

router.post('/changePassword', async (req, res) => {

    const { email, newPassword } = req.body;

    var data = await encryptData(newPassword);

    data_registration.updateOne({ email: email }, { $set: { password: data.password, iv: data.iv } }, (err, result) => {
        if(err) res.sendStatus(403);

        data_login.updateOne({ email: email }, { $set: { password: data.password, iv: data.iv } }, (err, result) => {
            if(err) res.sendStatus(403);
            res.json({ response: 'success' });
        });
    });

});


//___________________________________________________________________________________________________________________


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


//Encrypt data________________________________________
async function encryptData(password){

    const iv = crypto.randomBytes(16);

    // encrypt the string using encryption algorithm, private key and initialization vector
    const cipher = crypto.createCipheriv(algorithm, process.env.PASSWORD_SECRET_KEY, iv);
    let encryptedData = cipher.update(password, "utf-8", "hex");
    encryptedData += cipher.final("hex");
 
    // convert the initialization vector to base64 string
    const base64data = Buffer.from(iv, 'binary').toString('base64');

    return { iv: base64data, password: encryptedData };
}   


//decrypt data________________________________________
async function decryptData(iv, password){

    // convert initialize vector from base64 to buffer
    const origionalData = Buffer.from(iv, 'base64') 
 
    // decrypt the string using encryption algorithm and private key
    const decipher = crypto.createDecipheriv(algorithm, process.env.PASSWORD_SECRET_KEY, origionalData);
    let decryptedData = decipher.update(password, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
 
    // display the decrypted string
    console.log(decryptedData);
    return { password: decryptedData };
}


module.exports = router;