const express = require("express");
const { createBooking, listBookings } = require("../controllers/bookingController");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.route("/").get(requireAuth, listBookings).post(requireAuth, createBooking);

module.exports = router;
