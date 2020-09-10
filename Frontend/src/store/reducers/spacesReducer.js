import { createSlice } from "@reduxjs/toolkit";

export const spacesSlice = createSlice({
  name: "spaces",
  initialState: {
    rooms: [],
    desks: []


  },
  reducers: {
    setItems: (state, { payload }) => {
      state.rooms = payload.rooms;
      state.desks = payload.desks;
    },
  },
});

export const { setItems } = spacesSlice.actions;

export default spacesSlice.reducer;