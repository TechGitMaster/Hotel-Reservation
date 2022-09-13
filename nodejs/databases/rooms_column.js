const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (name_column) => {
    let schema_handle = null;
    let model_handle = null;
    switch(name_column){
        case "admin_rooms":
            schema_handle = new Schema({
                nameRoom: { type: String, required: true },
                addInfo: { type: String, required: true  },
                defaultPrice: { type: String, required: false  },
                goodPersons: { type: String, required: false  },
                pricePersons: { type: String, required: false  },
                typeRoom: { type: Boolean, required: true  },
                imgArr: { type: Array, required: false  },

                paymentMethod: { type: String, required: false },

                account_id: { type: String, required: false },
                checkin_date: { type: String, required: false },
                checkout_date: { type: String, required: false },
                acquired_persons: { type: String, required: false },
                persons_price: { type: String, required: false },
                total_day_price: { type: String, required: false },
                total_price: { type: String, required: false },
                first_name: { type: String, required: false },
                last_name: { type: String, required: false },
                phone_number: { type: String, required: false },
                email: { type: String, required: false },
                image_transaction: { type: Array, required: false },
                transaction_date: { type: String, required: false },
                confirmation_date: { type: String, required: false },

                confirmNot: { type: String, required: false },
                delete_room: { type: String, required: true }
            }, { timestamps: true });
        break;
        case "admin_user_reservation":
            schema_handle = new Schema({
                room_id: { type: String, required: true },
                email_id: { type: String, required: false },

                img_room: { type: Array, required: true },
                name_room: { type: String, required: true },

                defaultPrice: { type: String, required: false  },
                paymentMethod: { type: String, required: false },

                checkin_date: { type: String, required: true },
                checkout_date: { type: String, required: true },
                acquired_persons: { type: String, required: true },
                persons_price: { type: String, required: true },
                total_day_price: { type: String, required: true },
                total_price: { type: String, required: true },
                first_name: { type: String, required: true },
                last_name: { type: String, required: true },
                phone_number: { type: String, required: true },
                email: { type: String, required: true },
                image_transaction: { type: Array, required: false },
                confirmation_date: { type: String, required: false },
                transaction_date: { type: String, required: true },

                confirmNot: { type: String, required: true },

                delete_admin: { type: String, required: false },
                delete_user: { type: String, required: false }
            }, { timestamps: true });
        break;
    }

    if(mongoose.models[name_column]){
        model_handle = mongoose.models[name_column];
    }else{
        model_handle = mongoose.model(name_column, schema_handle);
    }
    
    return model_handle;
}