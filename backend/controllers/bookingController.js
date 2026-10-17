const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");

async function createBooking(request, response, next) {
  try {
    const body =
      request.body && typeof request.body === "object" && !Array.isArray(request.body)
        ? request.body
        : {};
    const { movie: movieId, showtime, seats } = body;

    if (!mongoose.isValidObjectId(movieId)) {
      return response.status(400).json({ message: "Choose a valid movie." });
    }
    if (typeof showtime !== "string" || !showtime.trim()) {
      return response.status(400).json({ message: "Choose a showtime." });
    }
    if (!Number.isInteger(seats) || seats < 1 || seats > 10) {
      return response.status(400).json({ message: "Seats must be a whole number from 1 to 10." });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return response.status(404).json({ message: "Movie not found." });
    }
    if (!movie.showtimes.includes(showtime.trim())) {
      return response.status(400).json({ message: "Choose a listed showtime." });
    }

    const booking = await Booking.create({
      movie: movie._id,
      user: request.user._id,
      customerName: request.user.name,
      email: request.user.email,
      showtime: showtime.trim(),
      seats,
      ticketPrice: movie.price,
      totalPrice: movie.price * seats,
    });
    await booking.populate("movie", "title genre");
    response.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

async function listBookings(request, response, next) {
  try {
    const bookings = await Booking.find({ user: request.user._id })
      .populate("movie", "title genre")
      .sort({ createdAt: -1 })
      .lean();
    response.json(bookings);
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, listBookings };
