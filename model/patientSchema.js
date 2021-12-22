const mongoose = require("mongoose");

const medic_his = {
  doctor_hospital_id: string,
  documents: {data: Buffer, contentType: String}
};

const vits = {
  bp: [{
    reading: Number,
    date: Date
  }],

  sugar: [{
    reading: Number,
    date: Date
  }],

  weight: [{
    reading: Number,
    date: Date
  }]
};

const patientAppointment = {
  doctor_id: string,
  time_slot: Number,
  visit_type: string,
};

const patientSchema = {
  profileImg: {data: Buffer, contentType: String},
  email: string,
  phone: Number,
  name: string,
  appointments: [patientAppointment],
  medical_history: [medic_his],
  vitals: [vits]
};

module.exports = mongoose.model("patient", patientSchema)
