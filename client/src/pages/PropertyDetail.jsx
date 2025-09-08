import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/PropertyDetail.scss";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { format } from "date-fns";
import { Button } from "@mui/material";

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [property, setProperty] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [loading, setLoading] = useState(true);
  const [existingBookings, setExistingBookings] = useState([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(
          `https://househunt-production-4887.up.railway.app/properties/${propertyId}`
        );
        const data = await response.json();
        setProperty(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching property:", err);
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const fetchExistingBookings = async () => {
    try {
      const response = await fetch(
        `https://househunt-production-4887.up.railway.app/properties/${propertyId}/bookings`
      );
      const data = await response.json();
      setExistingBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchExistingBookings();
    }
  }, [propertyId]);

  const handleBooking = async () => {
    if (!user) {
      setBookingError("Please log in to book this property");
      setShowErrorDialog(true);
      return;
    }

    if (user._id === property.creator._id) {
      setBookingError("You cannot book your own property");
      setShowErrorDialog(true);
      return;
    }

    if (!startDate || !endDate) {
      setBookingError("Please select both check-in and check-out dates");
      setShowErrorDialog(true);
      return;
    }

    const bookingStart = format(startDate, "yyyy-MM-dd");
    const bookingEnd = format(endDate, "yyyy-MM-dd");

    if (bookingStart === bookingEnd) {
      setBookingError("Booking must be for at least one night");
      setShowErrorDialog(true);
      return;
    }

    const hasOverlap = existingBookings.some((booking) => {
      const existingStart = format(new Date(booking.startDate), "yyyy-MM-dd");
      const existingEnd = format(new Date(booking.endDate), "yyyy-MM-dd");

      return (
        (bookingStart >= existingStart && bookingStart <= existingEnd) ||
        (bookingEnd >= existingStart && bookingEnd <= existingEnd) ||
        (bookingStart <= existingStart && bookingEnd >= existingEnd)
      );
    });

    if (hasOverlap) {
      setBookingError("These dates are already booked");
      setShowErrorDialog(true);
      return;
    }

    try {
      const response = await fetch("https://househunt-production-4887.up.railway.app/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user._id,
          listingId: propertyId,
          startDate: bookingStart,
          endDate: bookingEnd,
          totalPrice: totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      navigate("/trips");
    } catch (err) {
      setBookingError(err.message || "Failed to create booking");
      setShowErrorDialog(true);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!property) return <div>Property not found</div>;

  return (
    <>
      <div className="property-detail">
        <div className="property-images">
          {property.listingPhotoPaths?.map((photo, index) => (
            <img
              key={index}
              src={`https://househunt-production-4887.up.railway.app/${photo.replace("public", "")}`}
              alt={`${property.city} property`}
            />
          ))}
        </div>

        <div className="property-info">
          <h1>{property.title}</h1>
          <p>{property.description}</p>
          <p>
            Location: {property.city}, {property.province}, {property.country}
          </p>
          <p>Type: {property.type}</p>
          <p>Category: {property.category}</p>
          <p>Price: ₹{property.price} per night</p>
          {totalPrice > 0 && <p>Total Price: ₹{totalPrice}</p>}
        </div>

        <div className="booking-section">
          <h2>Book this property</h2>
          <div className="date-picker">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
            />
          </div>
          {bookingError && <div className="error">{bookingError}</div>}
          <button onClick={handleBooking}>Book Now</button>
        </div>
      </div>

      <Dialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        PaperProps={{
          className: "confirmation-dialog",
        }}
      >
        <DialogTitle>Booking Error</DialogTitle>
        <DialogContent>
          <p>{bookingError}</p>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button
            onClick={() => setShowErrorDialog(false)}
            className="dialog-button dialog-button-confirm"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PropertyDetail;
