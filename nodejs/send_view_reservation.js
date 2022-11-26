require('dotenv').config();
const express = require('express');
const router = express();
const path = require('path');

const hbs = require("nodemailer-express-handlebars");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD_MAIL
    }
});


const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: './nodejs/views/',
      defaultLayout: false,
    },
    viewPath: './nodejs/views/',
    extName: ".handlebars",
}
  
transporter.use('compile', hbs(handlebarOptions));

router.post('/view_send', async (req, res) => {
    const { room_id, checkin_date, checkout_date, acquired_persons, persons_price, total_day_price, total_price, first_name,
        last_name, phone_number, email, image_transaction, transaction_date, paymentMethod, transcation_id, guest_member,
        price, nameOfRoom, typeRoom, acquired_days, default_Personprice} = req.body.data;

    let data = {};

    data.Transcation_id = transcation_id;
    data.nameRoom = nameOfRoom;
    data.typeRoom = typeRoom;

    //Checking date_________________________________________________________________
    data.checkInDay = checkin_date.split(" ")[1];
    data.checkInMonY = checkin_date.split(" ")[0]+" "+checkin_date.split(" ")[2];
    data.checkOutDay = checkout_date.split(" ")[1];
    data.checkOutMonY = checkout_date.split(" ")[0]+" "+checkout_date.split(" ")[2];
    
    //Reservation details____________________________________________________________
    data.transaction_date = transaction_date;
    
    data.price = price;
    data.acquired_days = acquired_days;
    data.total_day_price = total_day_price;
    
    data.default_Personprice = default_Personprice;
    data.acquired_persons = acquired_persons;
    data.persons_price = persons_price;

    data.total_price = total_price;
    

    //Information name_______________________________________________________________
    data.first_name = first_name;
    data.last_name = last_name;
    data.email = email;
    data.phone_number = phone_number;
    
    
    let dataN = guest_member;

    for(let count1 = 1; count1 <= (10-guest_member.split('\n').length);count1++){
        dataN += '\n'+" , ";
    }

    data['count_1'] = (dataN.split('\n')[0].split(',')[0].length > 1 ? 1: '');
    data['fullnameG_1'] = dataN.split('\n')[0].split(',')[0];
    data['contactG_1'] = dataN.split('\n')[0].split(',')[1];
    data['count_2'] = (dataN.split('\n')[1].split(',')[0].length > 1 ? 2: '');
    data['fullnameG_2'] = dataN.split('\n')[1].split(',')[0];
    data['contactG_2'] = dataN.split('\n')[1].split(',')[1];
    data['count_3'] = (dataN.split('\n')[2].split(',')[0].length > 1 ? 3: '');
    data['fullnameG_3'] = dataN.split('\n')[2].split(',')[0];
    data['contactG_3'] = dataN.split('\n')[2].split(',')[1];
    data['count_4'] = (dataN.split('\n')[3].split(',')[0].length > 1 ? 4: '');
    data['fullnameG_4'] = dataN.split('\n')[3].split(',')[0];
    data['contactG_4'] = dataN.split('\n')[3].split(',')[1];
    data['count_5'] = (dataN.split('\n')[4].split(',')[0].length > 1 ? 5: '');
    data['fullnameG_5'] = dataN.split('\n')[4].split(',')[0];
    data['contactG_5'] = dataN.split('\n')[4].split(',')[1];
    data['count_6'] = (dataN.split('\n')[5].split(',')[0].length > 1 ? 6: '');
    data['fullnameG_6'] = dataN.split('\n')[5].split(',')[0];
    data['contactG_6'] = dataN.split('\n')[5].split(',')[1];
    data['count_7'] = (dataN.split('\n')[6].split(',')[0].length > 1 ? 7: '');
    data['fullnameG_7'] = dataN.split('\n')[6].split(',')[0];
    data['contactG_7'] = dataN.split('\n')[6].split(',')[1];
    data['count_8'] = (dataN.split('\n')[7].split(',')[0].length > 1 ? 8: '');
    data['fullnameG_8'] = dataN.split('\n')[7].split(',')[0];
    data['contactG_8'] = dataN.split('\n')[7].split(',')[1];
    data['count_9'] = (dataN.split('\n')[8].split(',')[0].length > 1 ? 9: '');
    data['fullnameG_9'] = dataN.split('\n')[8].split(',')[0];
    data['contactG_9'] = dataN.split('\n')[8].split(',')[1];
    data['count_10'] = (dataN.split('\n')[9].split(',')[0].length > 1 ? 10: '');
    data['fullnameG_10'] = dataN.split('\n')[9].split(',')[0];
    data['contactG_10'] = dataN.split('\n')[9].split(',')[1];


    transporter.sendMail({
        from: process.env.USER_MAIL,
        to: email,
        subject: 'Your reservation Details',
        template: 'send_reservation',
        context: data,
        attachments: [{
            filename: 'logo.png',
            path: './src/assets/logo/logo.png',
            cid: 'logo'
        }]
    }, (err, info) => {
        if(err)
        console.log(err);
    });

    res.json({ response: 'success' });
});















router.post('/asds', (req, res) => {
    

    let data = {
        header: 'Appointment request', 
        message: '083447 is your OTP admin login code.',
        reason: ''
    }

    transporter.sendMail({
        from: process.env.USER_MAIL,
        to: 'kylematthew375@gmail.com',
        subject: 'Your reservation Details',
        template: 'mail_template',
        context: data,
        attachments: [{
            filename: 'logo.png',
            path: './src/assets/logo/logo.png',
            cid: 'logo'
        }]
    }, (err, info) => {
        if(err)
        console.log(err);
    });

    res.json({ response: 'success' });
});


module.exports = router;