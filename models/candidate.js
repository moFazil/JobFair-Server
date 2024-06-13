const mongoose = require("mongoose");

// Define the Candidate schema
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: String,
  academicQualification: String,
  collegeName: String,
  percentage: String,
  skills: String,
  experiencebox: Boolean,
  experience: String,
  Completion: Boolean,
  certification: String,
  gender: String,
  dob: String,
  address: String,
  jobrole: String,
  slot: String,
  resume: String, // Store the resume file path as a string
});

// Create a Candidate model based on the schema
const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
