import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "./ReservationList.css";

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useSelector((state) => state.auth);

  // Get API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?._id) return;

      try {
        // First get all properties owned by the user
        const propertiesResponse = await fetch(
          `${API_URL}/properties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const propertiesData = await propertiesResponse.json();
        if (!propertiesResponse.ok) {
          throw new Error("Error fetching properties");
        }

        // Filter properties owned by the user
        const userProperties = propertiesData.filter(
          (property) => property.creator._id === user._id
        );

        // Get all bookings
        const bookingsResponse = await fetch(
          `${API_URL}/bookings/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const bookingsData = await bookingsResponse.json();
        if (!bookingsResponse.ok) {
          throw new Error("Error fetching bookings");
        }

        // Filter bookings for properties owned by the user
        const propertyReservations = bookingsData.filter((booking) =>
          userProperties.some(
            (property) => property._id === booking.listingId?._id
          )
        );

        setReservations(propertyReservations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user?._id, token, API_URL]); // Added API_URL as dependency

  const handleDeleteReservation = async (reservationId) => {
    try {
      const response = await fetch(
        `${API_URL}/bookings/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error canceling reservation");
      }

      setReservations(
        reservations.filter((reservation) => reservation._id !== reservationId)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="reservations-list">
      <h1>Reservations at Your Properties</h1>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reservations.length === 0 ? (
        <p>No reservations found for your properties.</p>
      ) : (
        <div className="reservations-grid">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <Link to={`/properties/${reservation.listingId._id}`}>
                <img
                  src={`${API_URL}/${reservation.listingId.listingPhotoPaths[0]?.replace(
                    "public",
                    ""
                  )}`}
                  alt={reservation.listingId.title}
                  className="reservation-image"
                />
              </Link>
              <div className="reservation-info">
                <h3>{reservation.listingId.title}</h3>
                <p>
                  {reservation.listingId.city}, {reservation.listingId.country}
                </p>
                <p>
                  Guest: {reservation.userId.firstName}{" "}
                  {reservation.userId.lastName}
                </p>
                <p>
                  Check-in:{" "}
                  {new Date(reservation.startDate).toLocaleDateString()}
                </p>
                <p>
                  Check-out:{" "}
                  {new Date(reservation.endDate).toLocaleDateString()}
                </p>
                <p>Total Price: ₹{reservation.totalPrice}</p>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteReservation(reservation._id)}
                  sx={{
                    mt: 2,
                    width: "100%",
                    backgroundColor: "#FF385C",
                    "&:hover": {
                      backgroundColor: "#FF385C",
                      opacity: 0.9,
                    },
                  }}
                >
                  Cancel Reservation
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationList;