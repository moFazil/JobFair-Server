const express = require("express");
const multer = require("multer");
const Candidate = require("../models/candidate");
const router = express.Router();
const fs = require("fs");
const nodemailer = require("nodemailer");
const ejs = require("ejs");

const availableSlots = {
  "11.00 am to 12.00 pm": { maxRegistrations: 110, currentRegistrations: 0 },
  "12.00 pm to 1.00 pm": { maxRegistrations: 110, currentRegistrations: 0 },
  "2.00 pm to 3.00 pm": { maxRegistrations: 110, currentRegistrations: 0 },
  "3.00 pm to 4.00 pm": { maxRegistrations: 110, currentRegistrations: 0 },
  "4.00 pm to 5.00 pm": { maxRegistrations: 110, currentRegistrations: 0 },
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      academicQualification,
      collegeName,
      percentage,
      skills,
      experiencebox,
      experience,
      Completion,
      certification,
      gender,
      dob,
      address,
      jobrole,
      slot,
    } = req.body;

    if (
      !availableSlots[slot] ||
      availableSlots[slot].currentRegistrations >=
        availableSlots[slot].maxRegistrations
    ) {
      return res
        .status(400)
        .json({ message: "Selected slot is not available" });
    }

    const resumePath = req.file.path;

    const candidate = new Candidate({
      name,
      email,
      mobile,
      academicQualification,
      collegeName,
      percentage,
      skills,
      experiencebox,
      experience,
      Completion,
      certification,
      gender,
      dob,
      address,
      jobrole,
      slot,
      resume: resumePath,
    });

    await candidate.save();

    const registrationDate = new Date().toLocaleDateString();
    const emailHtml = await ejs.renderFile("email-template.ejs", {
      name,
      email,
      mobile,
      slot,
    });

    await sendEmail(email, "Registration Confirmation", emailHtml);

    // Increase the current registration count for the slot
    availableSlots[slot].currentRegistrations++;

    // Disable the slot if it reaches the maximum registrations
    if (
      availableSlots[slot].currentRegistrations >=
      availableSlots[slot].maxRegistrations
    ) {
      delete availableSlots[slot];
    }

    res.status(200).json({ message: "Slot booked successfully" });
  } catch (error) {
    console.error("Error saving candidate information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all candidates
router.get("/all", async (req, res) => {
  try {
    const candidates = await Candidate.find(); // Retrieve all candidates from the database
    res.status(200).json(candidates); // Send the candidates as JSON response
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/slots", (req, res) => {
  const availableSlotCount = Object.values(availableSlots).reduce(
    (total, count) => total + count,
    0
  );
  console.log(
    `Request for available slots received. Total available slots: ${availableSlotCount}`
  );
  res.status(200).json({ availableSlots: Object.keys(availableSlots) });
});

// Function to send the email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org", // Replace with your SMTP server details
      port: 587, // Use the correct SMTP port
      secure: false, // true for 465, false for other ports
      auth: {
        user: "postmaster@emails.whytap.in", // Replace with your email address
        pass: "42fc2f3d9dfe51a9cbd524e604462615-7ca144d2-eced18e1", // Replace with your email password
      },
    });

    const info = await transporter.sendMail({
      from: "jobfair@whytap.in", // Replace with your email address
      to,
      subject,
      html,
    });
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: " + error);
  }
};

router.delete("/:id", async (req, res) => {
  const candidateId = req.params.id;

  try {
    // Find the candidate by ID
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Delete the resume file associated with the candidate
    fs.unlinkSync(candidate.resume);

    // Use findByIdAndRemove to delete the candidate by ID
    await Candidate.findByIdAndRemove(candidateId);

    // Mark the slot as available when a candidate is deleted
    const candidateSlot = candidate.slot;
    if (availableSlots[candidateSlot]) {
      availableSlots[candidateSlot].currentRegistrations--;
    }

    res
      .status(200)
      .json({
        message: "Candidate and associated resume deleted successfully",
      });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
