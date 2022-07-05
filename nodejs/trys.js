const express = require('express');
const router = express.Router();


router.get('/jwt', (req, res) => {
    res.sendStatus(408);
   // res.json({datas: "ahahahaha"});
});

module.exports = router;
