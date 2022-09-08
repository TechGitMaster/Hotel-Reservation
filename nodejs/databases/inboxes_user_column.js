const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (condition) => {
    var column = null;
    var name_db_column = condition;
    var returned_models = null;

    //registrations___________________________________________________
    switch(name_db_column){
        case "user_pending_mail":

            column = new Schema({
                
                fullname: { type: String, required: false },
                email: { type: String, required: false },
                reserved_email: { type: String, required: false },
                numGuest: { type: String, required: false },
                contact_num: { type: String, required: false },
                message: { type: String, required: false },
                dateArrival: { type: String, required: false },
                timeDate: { type: String, required: true },
                acceptedNot: { type: String, required: false },
                newNot: { type: Boolean, required: true }
            }, { timestamps: true });

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