const mongoose = require('mongoose');
const schema = mongoose.Schema;

module.exports = (name_column) => {
    let schema_handle = null;
    let models = null;

    switch(name_column){
        case "user_notification":
            schema_handle = new schema({
                email: { type: String, required: true },
                name: { type: String, required: true },
                message: { type: String, required: true },
                date: { type: String, required: true },
                deleteNot: { type: String, required: true }
            }, { timestamps: true });
        break;
        case "user_notification_click":
            schema_handle = new schema({
                email: { type: String, required: true },
                number: { type: Number, required: true },
                clicked: { type: Boolean, required: true }
            }, { timestamps: true });
        break;
    }

    if(mongoose.models[name_column]){
        models = mongoose.models[name_column];
    }else{ 
        models = mongoose.model(name_column, schema_handle);
    }
    return models;
}