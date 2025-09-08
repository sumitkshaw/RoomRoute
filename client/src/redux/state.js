import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    tripList: [],
    wishList: [],
    propertyList: [],
    reservationList: [],
  },
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = {
        ...action.payload.user,
        tripList: action.payload.user?.tripList || [],
        wishList: action.payload.user?.wishList || [],
        propertyList: action.payload.user?.propertyList || [],
        reservationList: action.payload.user?.reservationList || [],
      };
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = {
        tripList: [],
        wishList: [],
        propertyList: [],
        reservationList: [],
      };
      state.token = null;
    },
    setListings: (state, action) => {
      state.listings = action.payload.listings;
    },
    setTripList: (state, action) => {
      state.user.tripList = action.payload;
    },
    setWishList: (state, action) => {
      state.user.wishList = action.payload;
    },
    setPropertyList: (state, action) => {
      state.user.propertyList = action.payload;
    },
    setReservationList: (state, action) => {
      state.user.reservationList = action.payload;
    },
  },
});

export const {
  setLogin,
  setLogout,
  setListings,
  setTripList,
  setWishList,
  setPropertyList,
  setReservationList,
} = userSlice.actions;
export default userSlice.reducer;
