import React, {useEffect} from "react";
import { Switch, Route } from "react-router-dom";
import { Auth } from "aws-amplify";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Banner from "./components/banner/Banner";
import Nav from "./components/nav/Nav";
import Dashboard from "./components/dashboard/Dashboard";
import Environment from "./components/envi/Environment";
import Settings from "./components/settings/Settings";
import Security from "./components/security/Security";
import Spaces from "./components/spaces/Spaces";
import Map from "./components/map/Map";
import { setUserAction } from "./store/reducers/userReducer";
import { withAuthenticator } from "@aws-amplify/ui-react";


const App = ({setUser}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    getUserId();
  }, []);

  const getUserId = async () => {
    try {
      const response = await Auth.currentAuthenticatedUser();
      console.log("current User ===> ",response)
      dispatch(setUserAction(response.username));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* <Header /> */}
      <Banner />
      <div className="btn-section">
        <div className="nav-container">
          <Nav setUser={setUser}/>
        </div>
        <main className="main">
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/environment" component={Environment} />
            <Route path="/settings" component={Settings} />
            <Route path="/security" component={Security} />
            <Route path="/spaces" component={Spaces} />
            <Route path="/map" component={Map} />
          </Switch>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default withAuthenticator(App);
