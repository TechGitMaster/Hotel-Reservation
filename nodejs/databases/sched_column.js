const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const mongooseSchema = (name_column) => {
    let schema_handle = null;
    let models = null;
    switch(name_column){
        case "admin_calendarsched":
            schema_handle = new Schema({
                IDS: { type: String, required: true },
                usermail_id: { type: String, required: false },
                fullname: { type: String, required: true },
                email: { type: String, requires: true },
                reserved_email: { type: String, required: true },
                numGuest: { type: String, required: true },
                contact_num: { type: String, required: true },
                message: { type: String, required: true },
                timeDate: { type: String, required: true },
                date: { type: String, required: true },
                transaction_ID: { type: String, required: true },
                appointmentNot: { type: String, required: true },
                delete_admin: { type: Boolean, required: true }
            });
        break;
        case "admin_timeAMPM_Date":
            schema_handle = new Schema({
                name: { type: String, required: true },
                AM: { type: [], required: false },
                PM: { type: [], required: false },
                DATE: { type: [], required: false }
            });
        break;
        case "accepted_MailTime":
            schema_handle = new Schema({
                IDS: { type: String, required: true },
                timeDate: { type: String, required: true },
                time: { type: String, required: true },
                date: { type: String, required: true },
            });
        break;
    }

    if(mongoose.models[name_column]){
        models = mongoose.models[name_column];
    }else{ 
        models = mongoose.model(name_column, schema_handle);
    }
    return models;
}


module.exports = (name_column) => {
   return mongooseSchema(name_column);
}