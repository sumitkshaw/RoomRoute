const Listing = require("../models/Listing");
const { deleteBookingsByListing } = require("./booking");

// Delete a listing
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check if the user owns this listing
    if (listing.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this listing" });
    }

    // Delete all bookings associated with this listing
    await deleteBookingsByListing(id);

    // Delete the listing
    await listing.deleteOne();
    res.status(200).json({
      message: "Listing and associated bookings deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
