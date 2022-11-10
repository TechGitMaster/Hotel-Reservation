require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const data_admin = require('../databases/inboxes_column')('admin_inbox');
const data_user = require('../databases/inboxes_user_column')('user_pending_mail');
const noti_user = require('../databases/notification_column')('user_notification');
const noti_user_click = require('../databases/notification_column')('user_notification_click');

const arr_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD_MAIL
    }
});

router.post('/voided_parse', async (req, res) => {
    //month______________________________________________
    const data = await data_admin.find({ acceptedNot: 'new', appointmentNot: 'appointment' });
    let arr_email = [];
    if(data.length > 0){
        let num_count = 0;
        for await (let manifest of data){
            let condition_voided = false;
            let data_slice = manifest.timeDate.split(',')[1].split(" ");
            let year = parseInt(data_slice[2]);
            let month = arr_months.indexOf(data_slice[0]);
            let day = parseInt(data_slice[1]);
    
            let dates_t = new Date(year, month, day);
            let dates_i = new Date();
            if(dates_t.getFullYear() == dates_i.getFullYear()){
              if(dates_t.getMonth() == dates_i.getMonth()){
                if(dates_t.getDate() < dates_i.getDate()){
                    condition_voided = true;
                }
              }else if(dates_t.getMonth() < dates_i.getMonth()){
                condition_voided = true;
              }
            }

            if(condition_voided){
                //Voided______________________________
                var id = mongoose.Types.ObjectId();
    
                //Set cancel appointment for admin____________________________________
                await data_admin.updateOne({ _id: manifest._id }, 
                    { $set: { acceptedNot: 'true false' } } );
                
                if(manifest.email !== ''){
                    //Set cancel appointment for user______________________________________
                    await data_user.updateOne({ _id: manifest.usermail_id }, 
                        { $set: { acceptedNot: 'true false' } });
                }
                
                //Send mail for admin__________________________________________
                await new data_admin({
                    _id: id,
                    usermail_id: '',
                    fullname: manifest.fullname,
                    email: manifest.reserved_email,
                    reserved_email: 'Bot message',
                    numGuest: '',
                    contact_num: '',
                    message: 'The appointment has been voided Transaction ID: '+manifest.transaction_ID,
                    dateArrival: '',
                    timeDate: date_converting(),
                    favorite: false,
                    acceptedNot: 'new',
                    appointmentNot: 'void_app',
                    newNot: true,
                    folderName: 'inbox'
                }).save();
                await transporter.sendMail({
                    from: process.env.USER_MAIL,
                    to: process.env.USER_MAIL,
                    subject: 'Voided appointment',
                    text: `The appointment has been voided Transaction ID: ${manifest.transaction_ID}.`
                });

                //Send mail for user_________________________________________________
                if(manifest.email !== ''){
                    await new noti_user({
                        email: manifest.email,
                        name: 'Bot Message',
                        message: `The appointment has been voided Transaction ID: ${manifest.transaction_ID}`,
                        date: date_converting(),
                        deleteNot: 'new'
                    }).save();
                    let data_check = await noti_user_click.findOne({ email: manifest.email });
                        let numbers = data_check.number+1;
    
                    await noti_user_click.updateOne({ email: manifest.email },
                        { $set: { number: numbers, clicked: true } });

                                        
                    arr_email.push(manifest.email);
                }
                await transporter.sendMail({
                    from: process.env.USER_MAIL,
                    to: manifest.reserved_email,
                    subject: 'Voided appointment',
                    text: `The appointment has been voided Transaction ID: ${manifest.transaction_ID}.`
                });
            }

            
            num_count++;
            if(num_count == data.length){
                res.json({ response: "done_scanning", data: arr_email });
            }
        }
    }else{
        res.json({ response: "done_scanning", data: arr_email });
    }
});


//Get date converted____________________________________________________________________________________________
function date_converting(){
    let date = new Date();

    //Hours_________________________________________
    let hours = date.getHours()
    let converted_hours = (hours < 13 ? hours: (hours-12));
    let converted_hours2 = ( new String(converted_hours).split('').length == 1 ? `0${converted_hours}`:converted_hours);

    //AM-PM__________________________________________
    let amPm = (hours < 12 ? 'am':'pm');

    //Minutes___________________________________________
    let minutes = date.getMinutes();
    let converted_minutes = (minutes >= 10 ? minutes:`0${minutes}`);


    return `${converted_hours2}:${converted_minutes} ${amPm},${arr_months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
} 

module.exports = router;