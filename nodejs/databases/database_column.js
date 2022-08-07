const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (condition) => {
    var column = null;
    var name_db_column = condition;

    //registrations___________________________________________________
    switch(name_db_column){
        case "registered_accounts":

            column = new Schema({
                firstname: { type: String, required: true },
                lastname: { type: String, required: true },
                contactnumber: { type: String, required: true },
                email: { type: String, required: true },
                password: { type: String, required: true },
                passwordSecond: { type: String, required: true },
                gender: { type: String, required: true },
            }, { timestamps: true });

        break;
        case "login_accounts":

            column = new Schema({
                email: { type: String, required: true },
                password: { type: String, required: true }
            }, { timestamps: true });
            
        break;
    }

    
    return mongoose.model(name_db_column, column);
}