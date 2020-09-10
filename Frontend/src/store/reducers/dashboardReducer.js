import { createSlice } from "@reduxjs/toolkit";

export const dashSlice = createSlice({
  name: "dashboard",
  initialState: {
    overview:[], 
    rooms:[],
    desks:[],
    doors:[],
    envs:[]
  },
  reducers: {
    setItems: (state, { payload }) => {
      state.overview = payload.overview;
      state.rooms = payload.rooms;
      state.desks = payload.desks;
      state.doors = payload.doors;
      state.envs = payload.envs;
    },
    setPartial: (state, { payload }) => {
      state.rooms = payload.rooms;
      state.desks = payload.desks;
      state.doors = payload.doors;
      state.envs = payload.envs;
    },
  },
});

export const { setItems, setPartial } = dashSlice.actions;

export default dashSlice.reducer;