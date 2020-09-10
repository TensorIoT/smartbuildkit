import { configureStore, combineReducers } from "@reduxjs/toolkit";

import settingsReducer from "./reducers/settingsReducer";
import securityReducer from "./reducers/securityReducer";
import spacesReducer from "./reducers/spacesReducer";
import dashboardReducer from "./reducers/dashboardReducer";
import environmentReducer from "./reducers/environmentReducer";
import userReducer from "./reducers/userReducer";

const reducer = combineReducers({
  settings: settingsReducer,
  security: securityReducer,
  environ: environmentReducer,
  dash: dashboardReducer,
  spaces: spacesReducer,
  user: userReducer
});

export const store = configureStore({
  reducer,
});
