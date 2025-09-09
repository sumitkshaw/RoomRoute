import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Alert, CircularProgress, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const PropertyDetail = () => {
  const [property, setProperty] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [existingBookings, setExistingBookings] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  // Check if user owns the property
  const isOwner = property?.creator?._id === user?._id;

  // Fetch property details
  const fetchProperty = useCallback(async () => {
    try {
      const response = await fetch(`https://househunt-production-4887.up.railway.app/properties/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error fetching property");
      }

      setProperty(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch user bookings
  const fetchUserBookings = useCallback(async () => {
    if (!user?._id) return;

    try {
      const response = await fetch("https://househunt-production-4887.up.railway.app/bookings/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error fetching bookings");
      }

      // Filter bookings for this property
      const propertyBookings = data.filter(
        (booking) => booking.listingId?._id === id
      );
      setExistingBookings(propertyBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [user?._id, token, id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  useEffect(() => {
    if (startDate && endDate && property) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (nights > 0) {
        setTotalPrice(nights * property.price);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, property]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://househunt-production-4887.up.railway.app/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error deleting property");
      }

      navigate("/properties");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBooking = async () => {
    try {
      if (!user) {
        setError("Please log in to book a property");
        return;
      }

      if (isOwner) {
        setError("You cannot book your own property");
        return;
      }

      if (!startDate || !endDate) {
        setError("Please select check-in and check-out dates");
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        setError("Check-out date must be after check-in date");
        return;
      }

      // Check if user already has a booking for this property
      if (existingBookings.length > 0) {
        setError("You already have a booking for this property");
        return;
      }

      if (totalPrice <= 0) {
        setError("Invalid booking price");
        return;
      }

      const response = await fetch("https://househunt-production-4887.up.railway.app/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: id,
          startDate,
          endDate,
          totalPrice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error creating booking");
      }

      navigate("/trips");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="property-detail">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {property && (
        <>
          <h1>{property.title}</h1>
          <div className="property-images">
            {property.listingPhotoPaths?.map((photo, index) => (
              <img
                key={index}
                src={`https://househunt-production-4887.up.railway.app/${photo.replace("public", "")}`}
                alt={`${property.title} ${index + 1}`}
              />
            ))}
          </div>

          <div className="property-info">
            <p>{property.description}</p>
            <p>
              Location: {property.city}, {property.country}
            </p>
            <p>Price: ₹{property.price} per night</p>

            {!isOwner && (
              <div className="booking-form">
                <h3>Book this property</h3>
                <div className="date-inputs">
                  <label>
                    Check-in:
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </label>
                  <label>
                    Check-out:
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                    />
                  </label>
                </div>
                {totalPrice > 0 && (
                  <p className="total-price">Total Price: ₹{totalPrice} for {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} nights</p>
                )}
              </div>
            )}
          </div>

          <div className="action-buttons">
            {isOwner ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{
                  mt: 2,
                  backgroundColor: "#FF385C",
                  "&:hover": {
                    backgroundColor: "#FF385C",
                    opacity: 0.9,
                  },
                }}
              >
                Delete Property
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleBooking}
                disabled={!startDate || !endDate || totalPrice <= 0}
                sx={{
                  mt: 2,
                  backgroundColor: "#FF385C",
                  "&:hover": {
                    backgroundColor: "#FF385C",
                    opacity: 0.9,
                  },
                }}
              >
                Book Now
              </Button>
            )}
          </div>
        </>
      )}
      
      <style jsx>{`
        .property-detail {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .property-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .property-images img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .property-info {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 25px;
        }
        
        .property-info p {
          margin: 10px 0;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .booking-form {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        
        .date-inputs label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-weight: 500;
        }
        
        .date-inputs input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }
        
        .total-price {
          font-weight: bold;
          color: #FF385C;
          font-size: 18px;
          margin-top: 15px;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .property-images {
            grid-template-columns: 1fr;
          }
          
          .date-inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyDetail;