const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (condition) => {
    var column = null;
    var name_db_column = condition;

    //registrations___________________________________________________
    switch(name_db_column){
        case "registered_accounts":

            column = new Schema({
                firstname: { type: String, required: false },
                lastname: { type: String, required: false },
                fullName: { type: String, required: true },
                contactnumber: { type: String, required: false },
                email: { type: String, required: true },
                password: { type: String, required: false },
                iv: { type: String, required: false },
                gender: { type: String, required: false },
            }, { timestamps: true });

        break;
        case "login_accounts":

            column = new Schema({
                email: { type: String, required: true },
                password: { type: String, required: false },
                iv: { type: String, required: false },
                admin: { type: String, required: true },
                OTP_code: { type: String, required: false }
            }, { timestamps: true });
            
        break;
    }

    
    return mongoose.model(name_db_column, column);
}