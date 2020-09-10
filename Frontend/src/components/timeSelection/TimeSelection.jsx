import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const TimeSelection = ({ timeSelection, setTimeSelection }) => {
  const classes = useStyles();

  const setLinkClass = (time) => {
    if (timeSelection === time) {
      return `${classes.tab} ${classes.tabDark}`;
    } else {
      return classes.tab;
    }
  };

  return (
    <div className={classes.timeSelection}>
      <p
        className={setLinkClass("twentyfour")}
        onClick={() => setTimeSelection("twentyfour")}
      >
        24 hrs
      </p>
      <p
        style={{ marginRight: ".3em", marginLeft: ".3em" }}
        className={setLinkClass("week")}
        onClick={() => setTimeSelection("week")}
      >
        Week
      </p>
      <p
        className={setLinkClass("month")}
        onClick={() => setTimeSelection("month")}
      >
        Month
      </p>
    </div>
  );
};

export default TimeSelection;

const useStyles = makeStyles((theme) => ({
  timeSelection: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  tab: {
    borderBottom: "4px solid lightgray",
    marginTop: "0",
    padding: "0 1.5em 1em 1.5em",
    "&:hover": {
      borderBottom: "4px solid rgb(159, 239, 255)",
      cursor: "pointer",
    },
  },
  tabDark: {
    borderBottom: "4px solid rgb(0, 153, 249)",
  },
}));
