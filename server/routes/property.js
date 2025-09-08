const router = require("express").Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

/* DELETE PROPERTY */
router.delete("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const { userId } = req.body;

    // Find the property
    const property = await Listing.findById(listingId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the user is the owner
    if (property.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own properties" });
    }

    // Delete all bookings associated with this property
    await Booking.deleteMany({ listingId: listingId });

    // Delete the property
    await Listing.findByIdAndDelete(listingId);

    res.status(200).json({
      message: "Property and associated bookings deleted successfully",
    });
  } catch (err) {
    console.error("Delete property failed:", err);
    res
      .status(500)
      .json({ message: "Failed to delete property", error: err.message });
  }
});

module.exports = router;
