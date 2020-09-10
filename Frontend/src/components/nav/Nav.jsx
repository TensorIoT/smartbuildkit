import React, {useState}from "react";
import { Link, useLocation } from "react-router-dom";
import { Auth } from "aws-amplify";
import { useDispatch } from "react-redux";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import { setUserAction } from "../../store/reducers/userReducer";
import "./Nav.css";

const Nav = ({setUser}) => {
  const dispatch = useDispatch();
  let location = useLocation();
  const [openDialog, setOpenDialog] = useState(false);
  let pathname = location.pathname;

  const paths = [
    {
      path: "/spaces",
      title: "SPACES",
    },
    {
      path: "/environment",
      title: "ENVIRONMENT",
    },
    {
      path: "/security",
      title: "SECURITY",
    },
    {
      path: "/map",
      title: "MAP",
    },
    {
      path: "/settings",
      title: "SETTINGS",
    },
  ];

  const setLinkClass = (path) =>
    pathname === path ? "nav__link--light" : "nav__link--dark";

  const getLocation = () => {
    if (pathname === "/") {
      return <span className="path">DASHBOARD</span>;
    } else if (pathname === "/environment") {
      return <span className="path">ENVIRONMENT</span>;
    } else if (pathname === "/settings") {
      return <span className="path">SETTINGS</span>;
    } else if (pathname === "/security") {
      return <span className="path">SECURITY</span>;
    } else if (pathname === "/spaces") {
      return <span className="path">SPACES</span>;
    } else if (pathname === "/map") {
      return <span className="path">MAP</span>;
    }
  };
  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      window.location.reload(false);
      setUser("");
      dispatch(setUserAction(""));
      // dispatch(clearSettingsDataAction());
      // dispatch(clearTrackingDataAction());
    } catch (error) {
      console.log("error signing out", error);
    }
  };

  const generateLinks = () => {
    return paths.map((p, i) => {
      return (
        <div className="link-container" key={i}>
          <Link className={setLinkClass(p.path)} to={p.path}>
            {p.title}
          </Link>
        </div>
      );
    });
  };

  return (
    <nav className="nav">
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Are you sure you want to sign out?</DialogTitle>
        <DialogActions>
          <button className="dialogBtn yesBtn" onClick={() => signOut()}>
            Yes
          </button>
          <button
            className="dialogBtn cancelBtn"
            onClick={() => handleDialogClose()}
          >
            Cancel
          </button>
        </DialogActions>
      </Dialog>
      <div>
        <div>
          <div className="path-container">
            <Link className="nav__link--light path" to="/">
              HOME
            </Link>{" "}
            <span className="path-separator">{">>"}</span>
            {getLocation()}
          </div>
          <div className="link-container">
            <Link className={setLinkClass("/")} to="/">
              DASHBOARD
            </Link>
          </div>
        </div>
        {generateLinks()}
      </div>
      <div className="link-container signOut">
        <p onClick={() => handleDialogOpen()}>SIGN OUT</p>
      </div>
    </nav>
  );
};

export default Nav;
