const mongoose = require("mongoose");

const notesSchema = {
  patient_id: string,
  doctor_id: string,
  notes: [string]
};

module.exports = mongoose.model("note", notesSchema)
