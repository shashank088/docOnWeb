const mongoose = require("mongoose");

const appointmentDocs = new mongoose.Schema({
  documents:{
    data: Buffer,
    contentType: String
  }
});

const slot = new mongoose.Schema({
  time: Number,
  date: String
});
const doctorAppointment = new mongoose.Schema({
  patient_id: String,
  time_slot: [slot],
  visit_type: String,
  symptoms: String,
  docs: [appointmentDocs]
});

const doctorSchema = new mongoose.Schema({
  profileImg: {data: Buffer, contentType: String},
  email: String,
  password: String,
  phone: Number,
  name: String,
  profession: String,
  qualification: String,
  experience: Number,
  min_time: Number,
  max_time: Number,
  appointments: [doctorAppointment],
  rating: Number,
  numberOfPeopleRated: Number

});

// module.exports = mongoose.model("doctor", doctorSchema)

module.exports = doctorSchema;
