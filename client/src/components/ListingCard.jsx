import { useState, useEffect } from "react";
import "../styles/ListingCard.scss";
import {
  ArrowForward,
  ArrowBack,
  FavoriteBorder,
  Favorite,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const formatDate = (dateString) => {
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const ListingCard = ({
  listingId,
  creator,
  listingPhotoPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
  showDeleteButton = true,
}) => {
  /* SLIDER FOR IMAGES */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState([]);

  const goToPrevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? listingPhotoPaths.length - 1 : prevIndex - 1
    );
  };

  const goToNextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === listingPhotoPaths.length - 1 ? 0 : prevIndex + 1
    );
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ADD TO WISHLIST */
  const user = useSelector((state) => state.user);
  const isInWishlist = user?.wishList?.some(
    (item) => item?._id === listingId || item === listingId
  );

  const handleClick = () => {
    navigate(`/properties/${listingId}`);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user?._id) {
      alert("Please login to add to wishlist");
      return;
    }

    if (isUpdatingWishlist) return;

    setIsUpdatingWishlist(true);
    try {
      const response = await fetch(
        `https://househunt-production-4887.up.railway.app/users/${user._id}/${listingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update wishlist");
      }

      const data = await response.json();
      if (data?.wishList) {
        dispatch(setWishList(data.wishList));
      }
    } catch (err) {
      console.error("Add to wishlist failed:", err);
      alert(err.message || "Failed to update wishlist");
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://househunt-production-4887.up.railway.app/properties/${listingId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user?._id }),
        }
      );

      if (response.ok) {
        window.location.reload(); // Refresh the page to update the list
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete property");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchOccupiedDates = async () => {
      try {
        const response = await fetch(
          `https://househunt-production-4887.up.railway.app/bookings/listing/${listingId}`
        );
        if (response.ok) {
          const data = await response.json();
          setOccupiedDates(data);
        }
      } catch (err) {
        console.error("Failed to fetch occupied dates:", err);
      }
    };

    if (listingId && !booking) {
      fetchOccupiedDates();
    }
  }, [listingId, booking]);

  return (
    <div className="listing-card" onClick={handleClick}>
      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {listingPhotoPaths?.map((photo, index) => (
            <div className="slide" key={index}>
              <img
                src={`https://househunt-production-4887.up.railway.app/${photo.replace("public", "")}`}
                alt={`${city} ${category} ${index + 1}`}
                className="property-image"
              />
            </div>
          ))}
        </div>

        {listingPhotoPaths?.length > 1 && (
          <>
            <button className="prev-button" onClick={goToPrevSlide}>
              <ArrowBack />
            </button>
            <button className="next-button" onClick={goToNextSlide}>
              <ArrowForward />
            </button>
          </>
        )}

        {user && (
          <button
            className="favorite"
            onClick={handleFavorite}
            disabled={!user || isUpdatingWishlist}
          >
            {isInWishlist ? (
              <Favorite sx={{ color: "red" }} />
            ) : (
              <FavoriteBorder />
            )}
          </button>
        )}
      </div>

      <div className="listing-info">
        <h3>{`${city}, ${province}, ${country}`}</h3>
        <p>{category}</p>
        <p>{type}</p>
        {booking ? (
          <>
            <p>
              {formatDate(startDate)} - {formatDate(endDate)}
            </p>
            <p className="price">₹{totalPrice} total</p>
          </>
        ) : (
          <>
            <p className="price">₹{price} per night</p>
            {occupiedDates.length > 0 && (
              <div className="occupied-dates">
                <p className="occupied-label">Occupied Dates:</p>
                {occupiedDates.map((booking, index) => (
                  <p key={index} className="date-range">
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteButton && user?._id === creator?._id && (
        <div className="listing-actions">
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={isDeleting}
            sx={{
              width: "100%",
              backgroundColor: "#FF385C",
              "&:hover": {
                backgroundColor: "#FF385C",
                opacity: 0.9,
              },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Property"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ListingCard;
