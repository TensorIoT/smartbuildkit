import { createSlice } from "@reduxjs/toolkit";

import { devices } from "data";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {data:[]},
  reducers: {
    setDevices: (state, { payload }) => {
      state.data = payload
    },
  },
});

export const { setDevices } = settingsSlice.actions;

export default settingsSlice.reducer;
