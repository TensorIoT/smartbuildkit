import { createSlice } from "@reduxjs/toolkit";

export const environmentSlice = createSlice({
  name: "environ",
  initialState: {envAverage:{}, devices:[], leaks:[]},
  reducers: {
    setItems: (state, { payload }) => {
      state.envAverage = payload.envAverage
      state.devices = payload.devices
      state.leaks = payload.leaks
    },
  },
});

export const { setItems } = environmentSlice.actions;

export default environmentSlice.reducer;