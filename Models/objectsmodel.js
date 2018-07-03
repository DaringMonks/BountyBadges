const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ObjectiveSchema = new schema({
    Objective : String,
    Student : String

});

const Objective = mongoose.model('objective',ObjectiveSchema);

module.exports = Objective;