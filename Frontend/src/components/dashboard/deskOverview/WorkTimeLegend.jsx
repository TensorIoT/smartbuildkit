import React from "react";
import { deskLegend } from "data";
import { makeStyles } from "@material-ui/core/styles";

const WorkTimeLegend = ({ timeSelection = "twentyfour" }) => {
  const classes = useStyles();
  const legendData = deskLegend[timeSelection];
  if (!legendData) return "Missing/invalid time selection";

  const { lower, upper, thresholds } = legendData;
  const [t1, t2, t3] = thresholds;
  return (
    <>
      <div className={classes.legend}>
        <p className={`${classes.legendBox} ${classes.red}`}>
          {lower}-{t1}
        </p>
        <p className={`${classes.legendBox} ${classes.orange}`}>
          {t1}-{t2}
        </p>
        <p className={`${classes.legendBox} ${classes.lightblue}`}>
          {t2}-{t3}
        </p>
        <p className={`${classes.legendBox} ${classes.teal}`}>
          {t3}-{upper}
        </p>
      </div>
    </>
  );
};

export default WorkTimeLegend;

const useStyles = makeStyles((theme) => ({
  legend: {
    display: "flex",
    fontSize: "0.75rem",
    justifyContent: "center",
  },
  legendBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "65px",
    height: "20px",
    margin: "0",
    fontSize: "0.6rem",
    fontWeight: "500",
  },
  red: {
    backgroundColor: "#b20b0b",
    color: "white",
  },
  orange: {
    backgroundColor: "#ea8f01",
    color: "white",
  },
  lightblue: {
    backgroundColor: "#87dafa",
  },
  teal: {
    backgroundColor: "#c7f1ff",
  },
}));
