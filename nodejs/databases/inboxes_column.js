const mongoose = require('mongoose');
const Schema = mongoose.Schema;


function columns(name_column){
    var schema_column = new Schema();  
    var returned_schema = null;


    const schema_data = {
        IDS: { type: String, required: true },
        usermail_id: { type: String, required: false },
        fullname: { type: String, required: true },
        email: { type: String, required: false },
        reserved_email: { type: String, required: false },
        numGuest: { type: String, required: false },
        contact_num: { type: String, required: false },
        message: { type: String, required: false },
        dateArrival: { type: String, required: false },
        timeDate: { type: String, required: true },
        favorite: { type: Boolean, required: true },
        acceptedNot: { type: String, required: false },
        appointmentNot: { type: String, required: true }
    };

    if(name_column === 'admin_inbox'){
        schema_column = new Schema({
            usermail_id: { type: String, required: false },
            fullname: { type: String, required: false },
            email: { type: String, required: false },
            reserved_email: { type: String, required: false },
            numGuest: { type: String, required: false },
            contact_num: { type: String, required: false },
            message: { type: String, required: false },
            dateArrival: { type: String, required: false },
            timeDate: { type: String, required: true },
            favorite: { type: Boolean, required: false },
            acceptedNot: { type: String, required: false },
            appointmentNot: { type: String, required: false },
            newNot: { type: Boolean, required: true }
        }, { timestamps: true });
    }else{
        schema_column = new Schema(schema_data, { timestamps: true });
    }

    if(mongoose.models[name_column]){
        returned_schema = mongoose.models[name_column];
    }else{
        returned_schema = mongoose.model(name_column, schema_column);
    }

    return returned_schema;
}

module.exports = (name_column) => {
    return columns(name_column);
};