const mongoose = require("mongoose");

const medic_his = new mongoose.Schema({
  doctor_hospital_id: String,
  documents: {data: Buffer, contentType: String}
});

const vits = new mongoose.Schema({
  bp: [{reading: String,date: String}],
  sugar: [{reading: String,date: String}],
  weight: [{reading: String,date: String}]
});

const slot = new mongoose.Schema({
  time: Number,
  date: String
});

const patientAppointment = new mongoose.Schema({
  doctor_id: String,
  doctor_name: String,
  doctor_profession: String,
  time_slot: slot,
  visit_type: String,
});

const patientSchema = new mongoose.Schema({
  profileImg: {data: Buffer, contentType: String},
  phone: Number,
  name: String,
  appointments: [patientAppointment],
  medical_history: [medic_his],
  vitals: vits,
  bp: [{reading: String, date: String}]
});

// module.exports = mongoose.model("patient", patientSchema)
module.exports = patientSchema;
