const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (condition) => {
    var column = null;
    var name_db_column = condition;
    var returned_models = null;

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
            });

        break;
        case "login_accounts":

            column = new Schema({
                email: { type: String, required: true },
                password: { type: String, required: false },
                iv: { type: String, required: false },
                admin: { type: String, required: true },
                OTP_code: { type: String, required: false }
            });
            
        break;
    }


    //Checking if the model is already exists__________________________________
    //Because when the node.js start. It will automatically create a schema when you call it___________________
    //Once the schema is created, it must not create another schema which is already exists or else the error will popup_______
    if(mongoose.models[name_db_column]){
        returned_models = mongoose.models[name_db_column];
    }else{
        returned_models = mongoose.model(name_db_column, column);
    }

    return returned_models;
}