const middleware = require('./authorization');
const express = require('express');
const router = express.Router();

const notification_db = require('../databases/notification_column');
const notification_col = notification_db('user_notification');
const notification_click_col = notification_db('user_notification_click');

router.get('/save_tempo', (req, res) => {
    new notification_col({
        email: 'kylevelarde374@gmail.com',
        name: 'abPadilla',
        message: 'Your appointment has been accepted by the admin.',
        date: '09:25 pm,Sept 15 2022',
        deleteNot: 'new'
    }).save().then(() => {
        res.json();
    });  
});


//get clicked icon noti____________________________________________________________
router.post('/checkingIconNoti', middleware, async (req, res) => {
    const { email } = req.body;

    const data = await notification_click_col.findOne({ email: email });
    if(data != null){
        if(data.clicked){
            res.json({ response: 'success', count: data.number });
        }else{
            res.json({ response: 'nots' });
        }
    }else{
        res.json({ response: 'not' });
    }

});


//get notification____________________________________________________________
router.post('/getNotification', middleware, async (req, res) => {
    const { skip, limit } = req.body;
    
    const count = await notification_col.find({ email: req.token.email, deleteNot: 'new' }).count();

    const data = await notification_col.find({ email: req.token.email, deleteNot: 'new' }).sort({ createdAt: -1 }).skip(skip).limit(limit);

    if(data.length > 0){
        res.json({ response: 'success', data: data, count: count });
    }else{
        res.json({ response: 'not-have' });
    }   
});


//Update notification "delete from false to true" means it deleted___________________________________________________________
router.post('/deleteNotification', middleware, (req, res) => {
    const { _id } = req.body;

    notification_col.updateOne({ _id: _id }, { $set: { deleteNot: 'delete' } }).then(() => {
        res.json({ response: 'success'});
    });

});


//Update the clicked from "true to false"_________________________________________________
router.post('/change_clickedNoti', middleware, (req, res) => {
    const { email } = req.body;

    notification_click_col.updateOne({ email: email }, { $set: { number: 0, clicked: false } }).then(() => {
        res.json({ response: 'success'});
    });

});



module.exports = router;