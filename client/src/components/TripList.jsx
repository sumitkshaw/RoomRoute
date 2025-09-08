import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Alert } from "@mui/material";
import "./TripList.css";

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?._id) return;

      try {
        const response = await fetch("https://househunt-production-4887.up.railway.app/bookings/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Error fetching trips");
        }

        // Filter out trips where listingId is null (deleted properties)
        const validTrips = data.filter((trip) => trip.listingId);
        setTrips(validTrips);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user?._id, token]);

  const handleDeleteTrip = async (tripId) => {
    try {
      const response = await fetch(`https://househunt-production-4887.up.railway.app/bookings/${tripId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error canceling trip");
      }

      // Remove the deleted trip from state
      setTrips(trips.filter((trip) => trip._id !== tripId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="trips-list">
      <h1>Your Trips</h1>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {trips.length === 0 ? (
        <p>No trips found.</p>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <div key={trip._id} className="trip-card">
              <Link to={`/properties/${trip.listingId._id}`}>
                <img
                  src={`https://househunt-production-4887.up.railway.app/${trip.listingId.listingPhotoPaths[0]?.replace(
                    "public",
                    ""
                  )}`}
                  alt={trip.listingId.title}
                  className="trip-image"
                />
              </Link>
              <div className="trip-info">
                <h3>{trip.listingId.title}</h3>
                <p>
                  {trip.listingId.city}, {trip.listingId.country}
                </p>
                <p>Check-in: {new Date(trip.startDate).toLocaleDateString()}</p>
                <p>Check-out: {new Date(trip.endDate).toLocaleDateString()}</p>
                <p>Total Price: ₹{trip.totalPrice}</p>
                <div className="trip-actions">
                  <button
                    onClick={() => handleDeleteTrip(trip._id)}
                    className="delete-button"
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "1rem",
                      backgroundColor: "#ff385c",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                      fontWeight: "500",
                      marginTop: "10px",
                    }}
                  >
                    Cancel Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;
