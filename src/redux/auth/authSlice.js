import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInUser: (state, action) => {
      state.user = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    signOutUser: (state) => {
      state.user = null;
    },
  },
});

export const { signInUser, setUser, signOutUser } = authSlice.actions;
export default authSlice.reducer;
