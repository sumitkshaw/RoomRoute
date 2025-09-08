import { useEffect, useState } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../redux/state";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user);
  const tripList = user?.tripList || [];

  const dispatch = useDispatch();

  const getTripList = async () => {
    if (!user?._id) {
      setError("Please login to view your trips");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://househunt-production-4887.up.railway.app/users/${user._id}/trips`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }

      const data = await response.json();
      // Filter out any trips where the listing has been deleted
      const validTrips = data.filter(
        (trip) =>
          trip?.listingId &&
          trip?.hostId &&
          trip?.listingId._id &&
          trip?.hostId._id
      );

      dispatch(setTripList(validTrips));
      setLoading(false);
    } catch (err) {
      console.error("Fetch Trip List failed!", err.message);
      setError("Failed to load trips. Please try again later.");
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) {
      return;
    }

    try {
      const response = await fetch(`https://househunt-production-4887.up.railway.app/bookings/${tripId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete trip");
      }

      // Update the trip list in Redux state
      const updatedTrips = tripList.filter((trip) => trip._id !== tripId);
      dispatch(setTripList(updatedTrips));
    } catch (err) {
      console.error("Delete Trip failed!", err.message);
      setError(err.message || "Failed to delete trip. Please try again later.");
    }
  };

  useEffect(() => {
    getTripList();
  }, [user?._id]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!tripList?.length)
    return (
      <>
        <Navbar />
        <h1 className="title-list">Your Trip List</h1>
        <div className="no-trips">
          <p>You don't have any trips yet.</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="list">
        {tripList.map((trip) => {
          if (!trip?.listingId?._id || !trip?.hostId?._id) {
            return null; // Skip invalid trips
          }

          return (
            <div key={trip._id} className="trip-card">
              <ListingCard
                listingId={trip.listingId._id}
                creator={trip.hostId}
                listingPhotoPaths={trip.listingId.listingPhotoPaths}
                city={trip.listingId.city}
                province={trip.listingId.province}
                country={trip.listingId.country}
                category={trip.listingId.category}
                type={trip.listingId.type}
                price={trip.listingId.price}
                startDate={trip.startDate}
                endDate={trip.endDate}
                totalPrice={trip.totalPrice}
                booking={true}
              />
              <div className="trip-actions">
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteTrip(trip._id)}
                  sx={{
                    width: "100%",
                    backgroundColor: "#FF385C",
                    "&:hover": {
                      backgroundColor: "#FF385C",
                      opacity: 0.9,
                    },
                  }}
                >
                  Cancel Trip
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <Footer />
    </>
  );
};

export default TripList;
