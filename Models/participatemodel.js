const mongoose = require("mongoose");
const schema = mongoose.Schema;

const participateSchema = new schema({
    Name : String,
    startDate : String,
    endDate : String,
    Strategy : String,
    username : String,


});

const Participate = mongoose.model('participate',participateSchema);

module.exports = Participate;