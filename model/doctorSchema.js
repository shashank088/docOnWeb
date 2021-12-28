const mongoose = require("mongoose");

const appointmentDocs = new mongoose.Schema({
  documents:{
    data: Buffer,
    contentType: String
  }
});


const doctorAppointment = new mongoose.Schema({
  patient_id: String,
  patient_name: String,
  time: String,
  date: String,
  visit_type: String,
  symptoms: String,
  docs: [appointmentDocs]
});

const doctorSchema = new mongoose.Schema({
  profileImg: {data: Buffer, contentType: String},
  phone: Number,
  name: String,
  profession: String,
  qualification: String,
  experience: String,
  appointments: [doctorAppointment],
  rating: Number,
  numberOfPeopleRated: Number

});

// module.exports = mongoose.model("doctor", doctorSchema)

module.exports = doctorSchema;
