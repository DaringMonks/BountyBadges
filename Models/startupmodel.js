const mongoose = require("mongoose");
const schema = mongoose.Schema;

const startupSchema = new schema({
    Name : String,
    ProfileImage : String,
    Email : { type : String , unique : true },
    Password : String,
    CPassword : String,
    Phone : Number,
    Address : String,
    City :String,
    About : String,
    Auth : String,
    authCode : String,
    Code : String,
    Website :  String
});

const Startup = mongoose.model('startup',startupSchema);

module.exports = Startup;