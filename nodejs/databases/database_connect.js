const mongoose = require('mongoose');

const database = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URI, 
            { useNewUrlParser: true, useUnifiedTopology: true });
    }catch(err){
        console.error(err);
    }
}

module.exports = database;