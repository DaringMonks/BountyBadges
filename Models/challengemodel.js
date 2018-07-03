const mongoose = require("mongoose");
const schema = mongoose.Schema;

const challengeSchema = new schema({
    Category : String,
    Subcategory : String,
    Name : String,
    Skills:String,
    Time : Number,
    Reward : Number,
    Example : String,
    Student : String,
    Description : String,
    Objective1 : String,
    Objective2 : String,
    Objective3 : String,
    Objective4 : String,
    Objective5 : String,
    Status : String,
    Participated : String,
    StartDate : String

});

const Challenge = mongoose.model('challenge',challengeSchema);

module.exports = Challenge;