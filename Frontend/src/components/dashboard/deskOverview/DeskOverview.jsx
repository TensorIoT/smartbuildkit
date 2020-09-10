import React, { useState, useEffect } from "react";
import WorkTimeLegend from "./WorkTimeLegend";
import TimeSelection from "./../../timeSelection/TimeSelection";
import Tooltip from "@material-ui/core/Tooltip";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { generateXAxisObj } from "../../../utils/helperFunctions"
import { deskLegend } from "data";
import { useSelector} from "react-redux";


const DeskOverview = () => {
  const dash = useSelector((state) => state.dash);
  const [timeSelection, setTimeSelection] = useState("twentyfour");
  const [xAxisObj, setXAxisObj] = useState(null);
  const [hoveredData, setHoveredData] = useState({
    time: null,
    anchorEl: null,
  });



useEffect(() => {
  generateXAxisObj((obj) => setXAxisObj(obj));
},[])

  const classes = useStyles();

  // const setLinkClass = (time) => {
  //   if (timeSelection === time) {
  //     return `${classes.tab} ${classes.tabDark}`;
  //   } else {
  //     return classes.tab;
  //   }
  // };

  const setShowingLast = () => {
    if (timeSelection === "twentyfour") {
      return "working day: 05/07";
    } else if (timeSelection === "week") {
      return "working week: Week of 05/04";
    } else {
      return "4 working weeks";
    }
  };

  const setXaxis = () => {
    if (timeSelection === "twentyfour") {
      return (
        <div className={classes.rectangleContainer}>
          {xAxisObj.time.map((t, i) => (
            <p className={classes.time} key={i}>
              {t}
            </p>
          ))}
        </div>
      );
    } else if (timeSelection === "week") {
      return (
        <div className={classes.weekContainer}>
          <div className={classes.dayContainer}>
            {xAxisObj.dayWeek.map((d) => (
              <p className={classes.time}>{d}</p>
            ))}
          </div>
          <div className={classes.timeContainer}>
            {xAxisObj.timeWeek.map((t) => (
              <p className={classes.time}>{t}</p>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className={classes.weekContainer}>
          <div className={classes.dayContainer}>
            {xAxisObj.dayMonth.map((d) => (
              <p className={`${classes.time} ${classes.timeMonthLabel}`}>{d}</p>
            ))}
          </div>
          <div className={classes.timeContainer}>
            {xAxisObj.weekOf.map((w) => (
              <p className={classes.time}>Week of {w}</p>
            ))}
          </div>
        </div>
      );
    }
  };

  const timeMouseEnterHandler = (time) => (event) => {
    event.persist();
    setHoveredData({ time, anchorEl: event.target });
  };

  const timeMouseLeaveHandler = () =>
    setHoveredData({ time: null, anchorEl: null });

  const renderToolTip = () => {
    const { time, anchorEl } = hoveredData;
    if (!anchorEl) return null;

    return (
      <Tooltip
        title={`${time || 0} ${
          timeSelection === "twentyfour" ? "Minutes" : "Hours"
        }`}
        arrow
        placement="top"
        open={Boolean(anchorEl)}
        PopperProps={{
          anchorEl,
        }}
      >
        <div />
      </Tooltip>
    );
  };

  const getTimeClassname = (time, timeSelection) => {
    const legendData = deskLegend[timeSelection];
    if (legendData) {
      const [t1, t2, t3] = legendData.thresholds;
      if (time > t3) return classes.teal;
      if (time > t2) return classes.lightblue;
      if (time > t1) return classes.orange;
    }
    return classes.red;
  };

  return (
    <Paper elevation={2} className={classes.container}>
      <div className={classes.header}>
        <p className={classes.title}>Desk Overview</p>
        <TimeSelection
          timeSelection={timeSelection}
          setTimeSelection={setTimeSelection}
        />
      </div>
      <div className={classes.main}>
        <div>
          {renderToolTip()}
          {dash.overview.length > 0 && dash.overview.map((user) => (
            <div key={user.DEVICE_NAME} className={classes.userContainer}>
              <div className={classes.userText}>
                <p>{user.DEVICE_NAME}'s Desk</p>
                <p className={classes.userLocation}>{user.DEVICE_LOCATION}</p>
              </div>
              <div className={classes.rectangleContainer}>
                {user[timeSelection].map((time, index) => {
                  const colorClass = getTimeClassname(time, timeSelection);
                  // if (timeSelection === "week") {
                  //   const amColor = getTimeClassname(time.am, timeSelection);
                  //   const pmColor = getTimeClassname(time.pm, timeSelection);
                  //   return (
                  //     <>
                  //       <div
                  //         key={index + "am"}
                  //         className={`${classes.rectangle} ${amColor}`}
                  //         onMouseOver={timeMouseEnterHandler(time.am)}
                  //         onMouseLeave={timeMouseLeaveHandler}
                  //       />
                  //       <div
                  //         key={index + "pm"}
                  //         className={`${classes.rectangle} ${pmColor}`}
                  //         onMouseOver={timeMouseEnterHandler(time.pm)}
                  //         onMouseLeave={timeMouseLeaveHandler}
                  //       />
                  //     </>
                  //   );
                  // }
                  return (
                    <div
                      key={index}
                      className={`${classes.rectangle} ${colorClass}`}
                      onMouseOver={timeMouseEnterHandler(time)}
                      onMouseLeave={timeMouseLeaveHandler}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div className={classes.userContainer}>
            <div style={{ width: "105px" }}></div>
            {xAxisObj &&  setXaxis()}
          </div>
        </div>
      </div>
      <div className={classes.legendContainer}>
        <div className={classes.legend}>
          <p className={classes.minuteBox}>
            {timeSelection === "twentyfour" ? "Minutes" : "Hours"}
          </p>
          <WorkTimeLegend timeSelection={timeSelection} />
        </div>
        <div className={classes.showing}>Showing last {setShowingLast()}</div>
      </div>
    </Paper>
  );
};

export default DeskOverview;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "73%",
    padding: "2em",
    borderRadius: "10px",
  },
  header: {
    display: "flex",
    fontSize: "0.825rem",
    "& p": {
      marginTop: "0",
    },
  },
  main: {
    marginTop: "2em",
  },
  title: {
    fontSize: "1rem",
    marginRight: "2em",
  },
  userContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  userText: {
    width: "105px",
    fontSize: "0.825rem",
    marginBottom: "1em",
    "& p": {
      margin: "0",
    },
  },
  userLocation: {
    color: "rgb(0, 212, 255)",
  },
  rectangleContainer: {
    display: "flex",
    width: "80%",
  },
  rectangle: {
    backgroundColor: "#b20b0b",
    height: "2rem",
    width: "100%",
    marginRight: "1rem",
  },
  time: {
    width: "100%",
    // margin: "0 1.7em 0 0",
    fontSize: "0.75rem",
    textAlign: "center",
    flex:1
  },
  timeMonthLabel: {
    marginRight: 0,
  },
  weekContainer: {
    width: "80%",
  },
  dayContainer: {
    display: "flex",
    marginBottom: "1em",
  },
  timeContainer: {
    display: "flex",
  },
  legendContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5em",
  },
  legend: {
    display: "flex",
    fontSize: "0.75rem",
  },
  minuteBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    paddingRight: "1.5em",
    fontWeight: "600",
  },
  showing: {
    fontSize: "0.75rem",
    color: "#9c9c9c",
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
