const router = require("express").Router();

const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice } =
      req.body;

    // Validate required fields
    if (
      !customerId ||
      !hostId ||
      !listingId ||
      !startDate ||
      !endDate ||
      !totalPrice
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Get the listing to check if the user is the creator
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found!" });
    }

    // Check if the user is trying to book their own property
    if (listing.creator.toString() === customerId) {
      return res
        .status(400)
        .json({ message: "You cannot book your own property!" });
    }

    // Convert dates to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid dates provided!" });
    }

    // Check if end date is after start date
    if (end <= start) {
      return res
        .status(400)
        .json({ message: "End date must be after start date!" });
    }

    // Check for existing bookings with overlapping dates
    const existingBooking = await Booking.findOne({
      listingId,
      $or: [
        // Case 1: New booking's start date falls within an existing booking
        {
          startDate: { $lte: start },
          endDate: { $gt: start },
        },
        // Case 2: New booking's end date falls within an existing booking
        {
          startDate: { $lt: end },
          endDate: { $gte: end },
        },
        // Case 3: New booking completely encompasses an existing booking
        {
          startDate: { $gte: start },
          endDate: { $lte: end },
        },
      ],
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "These dates are already booked!" });
    }

    // Validate total price
    if (isNaN(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({ message: "Invalid total price!" });
    }

    const newBooking = new Booking({
      customerId,
      hostId,
      listingId,
      startDate: start,
      endDate: end,
      totalPrice,
    });

    await newBooking.save();

    // Populate the booking with customer and listing details
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("customerId", "firstName lastName email profileImagePath")
      .populate("listingId")
      .populate("hostId", "firstName lastName email profileImagePath");

    res.status(200).json(populatedBooking);
  } catch (err) {
    console.error("Booking creation failed:", err);
    res
      .status(500)
      .json({ message: "Failed to create booking!", error: err.message });
  }
});

/* GET USER BOOKINGS (as a customer) */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ customerId: userId })
      .populate("listingId")
      .populate("hostId", "firstName lastName email profileImagePath");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Fetch bookings failed:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch bookings!", error: err.message });
  }
});

/* GET HOST RESERVATIONS (as a property owner) */
router.get("/host/:hostId", async (req, res) => {
  try {
    const { hostId } = req.params;
    const reservations = await Booking.find({ hostId })
      .populate("customerId", "firstName lastName email profileImagePath")
      .populate("listingId")
      .sort({ startDate: 1 }); // Sort by start date ascending
    res.status(200).json(reservations);
  } catch (err) {
    console.error("Fetch reservations failed:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch reservations!", error: err.message });
  }
});

/* GET LISTING OCCUPIED DATES */
router.get("/listing/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const bookings = await Booking.find({
      listingId,
      endDate: { $gte: new Date() }, // Only get current and future bookings
    }).select("startDate endDate");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Fetch occupied dates failed:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch occupied dates!", error: err.message });
  }
});

/* DELETE BOOKING */
router.delete("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find and delete the booking
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete booking failed:", err);
    res
      .status(500)
      .json({ message: "Failed to delete booking", error: err.message });
  }
});

module.exports = router;
