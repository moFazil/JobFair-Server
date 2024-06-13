const express = require("express");
const router = express.Router();

// Define an array of available slots (you can replace this with your logic)
const availableSlots = [
  "11.00 am to 12.00 pm",
  "12.00 pm to 1.00 pm",
  "2.00 pm to 3.00 pm",
  "3.00 pm to 4.00 pm",
  "4.00 pm to 5.00 pm",
];

// Route to fetch available slots
router.get("/", (req, res) => {
  res.json(availableSlots);
});

module.exports = router;
