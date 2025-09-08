const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { listingId, startDate, endDate, totalPrice } = req.body;
    const userId = req.user.id;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check if user is trying to book their own property
    if (listing.creator.toString() === userId) {
      return res
        .status(400)
        .json({ error: "You cannot book your own property" });
    }

    // Calculate number of nights
    const nights = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );

    // Check if booking is for 0 nights
    if (nights <= 0) {
      return res
        .status(400)
        .json({ error: "Booking must be for at least 1 night" });
    }

    const newBooking = new Booking({
      listingId,
      userId,
      startDate,
      endDate,
      totalPrice,
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if the user owns this booking
    if (booking.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this booking" });
    }

    await booking.deleteOne();
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete all bookings for a listing
const deleteBookingsByListing = async (listingId) => {
  try {
    await Booking.deleteMany({ listingId });
    return true;
  } catch (err) {
    console.error("Error deleting bookings:", err);
    return false;
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId }).populate("listingId");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBooking,
  deleteBooking,
  getUserBookings,
  deleteBookingsByListing,
};
