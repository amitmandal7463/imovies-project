const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    },
    showtime: { type: String, required: true, trim: true },
    seats: { type: Number, required: true, min: 1, max: 10, validate: Number.isInteger },
    ticketPrice: { type: Number, required: true, min: 1, validate: Number.isInteger },
    totalPrice: { type: Number, required: true, min: 1, validate: Number.isInteger },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
