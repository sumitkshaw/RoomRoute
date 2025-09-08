import "../styles/List.scss";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { useEffect } from "react";

const WishList = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    // Filter out any undefined or deleted listings from wishlist
    const validWishList = user?.wishList?.filter(
      (listing) => listing && listing._id && listing.creator
    );

    // Update redux state if the filtered wishlist is different
    if (validWishList && validWishList.length !== user?.wishList?.length) {
      dispatch(setWishList(validWishList));
    }
  }, [user?.wishList, dispatch]);

  // If no wishlist or empty wishlist, show a message
  if (!user?.wishList || user.wishList.length === 0) {
    return (
      <>
        <Navbar />
        <h1 className="title-list">Your Wish List</h1>
        <div className="list">
          <p>No properties in your wishlist yet!</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>
      <div className="list">
        {user.wishList
          .filter((listing) => listing && listing._id && listing.creator) // Additional safety check
          .map(
            ({
              _id,
              creator,
              listingPhotoPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotoPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
              />
            )
          )}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
