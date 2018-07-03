const mongoose = require("mongoose");
const schema = mongoose.Schema;

const EducationSchema = new schema({
    Class : String,
    Instname : String,
    Marks : String,
    Duration : String,
    Student : String

});

const Education = mongoose.model('education',EducationSchema);

module.exports = Education;