const mongoose = require("mongoose");

const appointmentDocs = {
  documents:{
    data: Buffer,
    contentType: String
  }
};

const doctorAppointment = {
  patient_id: string,
  time_slot: Number,
  visit_type: string,
  symptoms: string,
  docs: [appointmentDocs]
};

const doctorSchema = {
  profileImg: {data: Buffer, contentType: String},
  email: string,
  phone: Number,
  name: string,
  qualification: string,
  experience: Number,
  appointments: [doctorAppointment],
  rating: Number,
  numberOfPeopleRated: Number

};

module.exports = mongoose.model("doctor", doctorSchema)
