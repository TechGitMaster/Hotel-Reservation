const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const mongooseSchema = (name_column) => {
    let schema_handle = null;
    let models = null;
    switch(name_column){
        case "admin_calendarsched":
            schema_handle = new Schema({
                IDS: { type: String, required: true },
                fullname: { type: String, required: true },
                email: { type: String, requires: true },
                numGuest: { type: String, requires: true },
                contact_num: { type: String, requires: true },
                message: { type: String, requires: true },
                timeDate: { type: String, requires: true },
                date: { type: String, requires: true },
                appointmentNot: { type: Boolean, requires: true }
            }, { timeStamp: true });
        break;
        case "admin_timeAMPM_Date":
            schema_handle = new Schema({
                name: { type: String, required: true },
                AM: { type: [], required: false },
                PM: { type: [], required: false },
                DATE: { type: [], required: false }
            }, { timeStamp: true });
        break;
        case "accepted_MailTime":
            schema_handle = new Schema({
                IDS: { type: String, required: true },
                timeDate: { type: String, required: true },
                time: { type: String, required: true },
                date: { type: String, required: true },
            }, { timeStamp: true });
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