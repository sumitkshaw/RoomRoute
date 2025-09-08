import { useEffect, useState } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);
  const user = useSelector((state) => state.user);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReservations = async () => {
    if (!user?._id) {
      setError("Please login to view your reservations");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://househunt-production-4887.up.railway.app/bookings/host/${user._id}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const data = await response.json();
      setReservations(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Reservations failed!", err.message);
      setError("Failed to load reservations. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getReservations();
  }, [user?._id]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!reservations?.length)
    return (
      <>
        <Navbar />
        <h1 className="title-list">Your Property Reservations</h1>
        <div className="no-reservations">
          <p>You don't have any reservations yet.</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Property Reservations</h1>
      <div className="list">
        {reservations.map((reservation) => (
          <div key={reservation._id} className="reservation-card">
            <div className="property-info">
              <img
                src={`https://househunt-production-4887.up.railway.app/${reservation.listingId.listingPhotoPaths[0].replace(
                  "public",
                  ""
                )}`}
                alt={reservation.listingId.title}
              />
              <div className="details">
                <h2>{reservation.listingId.title}</h2>
                <p>{`${reservation.listingId.city}, ${reservation.listingId.province}`}</p>
              </div>
            </div>
            <div className="guest-info">
              <h3>Guest Information</h3>
              <div className="guest-details">
                <img
                  src={`https://househunt-production-4887.up.railway.app/${reservation.customerId.profileImagePath.replace(
                    "public",
                    ""
                  )}`}
                  alt={`${reservation.customerId.firstName} ${reservation.customerId.lastName}`}
                />
                <div>
                  <p className="guest-name">
                    {`${reservation.customerId.firstName} ${reservation.customerId.lastName}`}
                  </p>
                  <p className="guest-email">{reservation.customerId.email}</p>
                </div>
              </div>
            </div>
            <div className="booking-info">
              <div className="dates">
                <p>
                  <strong>Check-in:</strong> {formatDate(reservation.startDate)}
                </p>
                <p>
                  <strong>Check-out:</strong> {formatDate(reservation.endDate)}
                </p>
              </div>
              <p className="price">
                <strong>Total Price:</strong> ₹{reservation.totalPrice}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;
