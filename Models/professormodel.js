const mongoose = require("mongoose");
const schema = mongoose.Schema;

const professorSchema = new schema({
    Name : String,
    Gender : String,
    Image : String,
    Location : String,
    Profession : String,
    Mobile : { type : Number , unique : true },
    Email : String,
    About : String,
    Status : String,
    Subjects :String,
    Education1 : String,
    Education2 : String,
    Education3 : String,
    Education4 : String,
    Experience1 : String,
    Experience2 : String,
    Experience3 : String,
    Experience4 : String,
    Experience5 : String,
    Address : String,
});

const Professor = mongoose.model('professor',professorSchema);

module.exports = Professor;