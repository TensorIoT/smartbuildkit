import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
// import App from "./App";
import AppWithAuth from "./AppWithAuth"
import Amplify from "aws-amplify";
import * as serviceWorker from "./serviceWorker";
import awsConfig from "./awsConfig";

import { store } from "./store/store";

Amplify.configure(awsConfig);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      {/* <App /> */}
      <AppWithAuth />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
