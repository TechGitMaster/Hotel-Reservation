require('dotenv').config();
const jwt = require('jsonwebtoken');
const column = require('../databases/logReg_column');
const data_login = column('login_accounts');

module.exports = (req, res, next) => {
    const auth = req.headers['authorization'];
    if(typeof auth !== 'undefined'){
        const token = auth.split(' ')[1];
        if(token !== ''){
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
                if(err) {res.sendStatus(403)}else{
                    data_login.findOne({ email: result.email }).then((dataRest) => {
                        if(dataRest != null){
                            if(dataRest.admin === 'not-admin'){
                                req.token = result;

                                next();
                            }else{
                                res.sendStatus(401);
                            }
                        }else{
                            res.sendStatus(401);
                        }
                    }); 
                }
                
            });
        }else{
            res.sendStatus(401);
        }
    }else{
        res.sendStatus(403);
    }
}