import { useParams } from "react-router-dom";
import "../styles/List.scss"
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import { useEffect, useState, useCallback } from "react";
import Loader from "../components/Loader"
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer"

const SearchPage = () => {
  const [loading, setLoading] = useState(true)
  const { search } = useParams()
  const listings = useSelector((state) => state.listings)
  const dispatch = useDispatch()

  // Get API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL;

  const getSearchListings = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/properties/search/${search}`, {
        method: "GET"
      })

      const data = await response.json()
      dispatch(setListings({ listings: data }))
      setLoading(false)
    } catch (err) {
      console.log("Fetch Search List failed!", err.message)
    }
  }, [search, dispatch, API_URL])

  useEffect(() => {
    getSearchListings()
  }, [getSearchListings])
  
  return loading ? <Loader /> : (
    <>
      <Navbar />
      <h1 className="title-list">Search Results for: {search}</h1>
      <div className="list">
        {listings?.length > 0 ? (
          listings.map(({
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
          ))
        ) : (
          <div className="no-results">
            <h2>No properties found for "{search}"</h2>
            <p>Try adjusting your search terms or browse our categories</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SearchPage;