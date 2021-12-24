const mongoose = require("mongoose");

const medic_his = new mongoose.Schema({
  doctor_hospital_id: String,
  documents: {data: Buffer, contentType: String}
});

const vits = new mongoose.Schema({
  bp: [{reading: Number,date: Date}],
  sugar: [{reading: Number,date: Date}],
  weight: [{reading: Number,date: Date}]
});

const slot = new mongoose.Schema({
  time: Number,
  date: String
});

const patientAppointment = new mongoose.Schema({
  doctor_id: String,
  time_slot: [slot],
  visit_type: String,
});

const patientSchema = new mongoose.Schema({
  profileImg: {data: Buffer, contentType: String},
  email: String,
  password: String,
  phone: Number,
  name: String,
  appointments: [patientAppointment],
  medical_history: [medic_his],
  vitals: [vits]
});

// module.exports = mongoose.model("patient", patientSchema)
module.exports = patientSchema;
