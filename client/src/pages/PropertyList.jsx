import "../styles/List.scss";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import { useEffect, useState } from "react";
import { setPropertyList } from "../redux/state";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const user = useSelector((state) => state.user);
  const propertyList = user?.propertyList;

  const dispatch = useDispatch();

  const getPropertyList = async () => {
    try {
      const response = await fetch(
        `https://househunt-production-4887.up.railway.app/users/${user._id}/properties`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      dispatch(setPropertyList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch all properties failed", err.message);
      setError("Failed to load properties");
      setLoading(false);
    }
  };

  const handleDeleteClick = (propertyId) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `https://househunt-production-4887.up.railway.app/properties/${propertyToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user._id }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete property");
      }

      // Update the property list in Redux state
      const updatedProperties = propertyList.filter(
        (property) => property._id !== propertyToDelete
      );
      dispatch(setPropertyList(updatedProperties));

      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (err) {
      console.error("Delete property failed:", err);
      setError(err.message || "Failed to delete property");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  useEffect(() => {
    if (user?._id) {
      getPropertyList();
    }
  }, [user?._id]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!propertyList?.length)
    return (
      <>
        <Navbar />
        <h1 className="title-list">Your Property List</h1>
        <div className="no-properties">
          <p>You don't have any properties yet.</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Property List</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="list">
        {propertyList?.map((property) => (
          <div key={property._id} className="property-card">
            <div className="property-info">
              <ListingCard
                listingId={property._id}
                creator={property.creator}
                listingPhotoPaths={property.listingPhotoPaths}
                city={property.city}
                province={property.province}
                country={property.country}
                category={property.category}
                type={property.type}
                price={property.price}
                showDeleteButton={false}
              />
            </div>
            <div className="property-actions">
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteClick(property._id)}
                sx={{
                  width: "100%",
                  backgroundColor: "#FF385C",
                  "&:hover": {
                    backgroundColor: "#FF385C",
                    opacity: 0.9,
                  },
                }}
              >
                Delete Property
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          className: "confirmation-dialog",
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to delete this property? This action will also
            cancel all bookings for this property and cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleDeleteCancel} className="cancel-button">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} className="confirm-button">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default PropertyList;
