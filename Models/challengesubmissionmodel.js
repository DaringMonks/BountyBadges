const mongoose = require("mongoose");
const schema = mongoose.Schema;

const submissionSchema = new schema({
    Name : String,
    Solution : String,
    Description : String,
    Username : String,
    UserEmail : String,
    isAuth : String,
    isPOI : String,
    POI : Number

});

const Submission = mongoose.model('submission',submissionSchema);

module.exports = Submission;