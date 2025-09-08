const router = require("express").Router();

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");

/* GET TRIP LIST */
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(trips);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find trips!", error: err.message });
  }
});

/* GET WISHLIST */
router.get("/:userId/wishlist", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
      path: "wishList",
      populate: {
        path: "creator",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out any null or undefined listings
    const validWishList = user.wishList.filter(
      (listing) => listing && listing._id
    );

    // If there were invalid listings, update the user's wishlist
    if (validWishList.length !== user.wishList.length) {
      user.wishList = validWishList;
      await user.save();
    }

    res.status(200).json(validWishList);
  } catch (err) {
    console.error("Fetch wishlist failed:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch wishlist", error: err.message });
  }
});

/* ADD/REMOVE LISTING FROM WISHLIST */
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;

    // Validate userId and listingId
    if (!userId || !listingId) {
      return res
        .status(400)
        .json({ message: "User ID and Listing ID are required" });
    }

    // Find user without populating wishList first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      // If listing doesn't exist, remove it from wishlist if it's there
      await User.findByIdAndUpdate(userId, {
        $pull: { wishList: listingId },
      });

      // Get updated user with populated wishList
      const updatedUser = await User.findById(userId).populate({
        path: "wishList",
        populate: {
          path: "creator",
        },
      });

      return res.status(200).json({
        message: "Listing not found, removed from wishlist",
        wishList: updatedUser.wishList,
      });
    }

    // Check if listing is already in wishlist
    const isInWishlist = user.wishList.includes(listingId);

    if (isInWishlist) {
      // Remove from wishlist
      await User.findByIdAndUpdate(userId, {
        $pull: { wishList: listingId },
      });
    } else {
      // Add to wishlist
      await User.findByIdAndUpdate(userId, {
        $addToSet: { wishList: listingId },
      });
    }

    // Get updated user with populated wishList
    const updatedUser = await User.findById(userId).populate({
      path: "wishList",
      populate: {
        path: "creator",
      },
    });

    res.status(200).json({
      message: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
      wishList: updatedUser.wishList,
    });
  } catch (err) {
    console.error("Wishlist update failed:", err);
    res.status(500).json({
      message: "Failed to update wishlist",
      error: err.message,
    });
  }
});

/* GET PROPERTY LIST */
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId }).populate(
      "creator"
    );
    res.status(202).json(properties);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find properties!", error: err.message });
  }
});

/* GET RESERVATION LIST */
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ hostId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(reservations);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find reservations!", error: err.message });
  }
});

module.exports = router;
