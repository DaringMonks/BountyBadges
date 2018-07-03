const mongoose = require("mongoose");
const schema = mongoose.Schema;

const querySchema = new schema({
    Name : String,
    Email: String,
    Subject : String,
    Message : String
    });

const Query = mongoose.model('query',querySchema);

module.exports = Query;