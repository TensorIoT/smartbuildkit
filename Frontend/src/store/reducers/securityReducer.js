import { createSlice } from "@reduxjs/toolkit";

export const securitySlice = createSlice({
  name: "security",
  initialState: {doors:[], rooms:[]},
  reducers: {
    setItems: (state, { payload }) => {
      state.doors = payload.DOORS;
      state.rooms = payload.ROOMS;
    },
  },
});

export const { setItems } = securitySlice.actions;

export default securitySlice.reducer;