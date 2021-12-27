const mongoose = require("mongoose");

const noteSchema =new mongoose.Schema({
  patient_id: String,
  doctor_id: String,
  notes: [String]
});

// module.exports = mongoose.model("note", noteSchema)
module.exports = noteSchema;
