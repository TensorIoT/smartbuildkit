import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Doughnut, Bar } from "react-chartjs-2";
import Paper from "@material-ui/core/Paper";
import TimeSelection from "./../timeSelection/TimeSelection";
import WorkTimeLegend from "./../dashboard/deskOverview/WorkTimeLegend";
import { cloneDeep } from "lodash";
import { getPreviousWorkday } from "../../utils/helperFunctions";
import moment from "moment";

const SpacesDeskChart = ({ usersDesk, xAxisObj }) => {
  const [timeSelection, setTimeSelection] = useState("twentyfour");
  const [weekOf, setWeekOf] = useState("");
  const [lastWorkingDay, setLastWorkingDay] = useState("");

  // const addWeek = () => {
  //   let daySumArr = [];
  //   usersDesk.week.map((i) => daySumArr.push(i.am + i.pm));
  //   return daySumArr;
  // };
  useEffect(() => {
    setWeekOf(moment().format("M/D"))
    setLastWorkingDay(getPreviousWorkday());
  },[])
  const setShowingLast = () => {
    if (timeSelection === "twentyfour") {
      return `Last Working Day ${lastWorkingDay}`;
    } else if (timeSelection === "week") {
      return `Week of ${weekOf}`;
    } else {
      return "Last 4 Weeks";
    }
  };

  const vacantBool = usersDesk.CURRENT_STATUS === "VACANT";

  const doughnutState = {
    labels: ["Occupied", "Vacant"],
    datasets: [
      {
        data: [usersDesk.OCCUPANCY_PERCENTAGES.OCCUPIED, usersDesk.OCCUPANCY_PERCENTAGES.VACANT],
        backgroundColor: ["lightblue", "#B21F00"],
        hoverBackgroundColor: vacantBool ? "#501800" : "blue",
      },
    ],
  };

  const barState = {
    labels:
      timeSelection === "twentyfour"
        ? xAxisObj.time
        : timeSelection === "week"
          ? xAxisObj.dayWeek
          : xAxisObj.dayMonth,
    datasets: [
      {
        // data: timeSelection === "week" ? addWeek() : usersDesk[timeSelection],
        data: usersDesk[timeSelection],
        backgroundColor: "lightblue",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Operational Hours",
          },
          display: true,
          gridLines: {
            display: false,
          },
        },
      ],
      // yAxes: [
      //   {
      //     scaleLabel: {
      //       display: true,
      //       labelString: "Time",
      //     },
      //     display: true,
      //     gridLines: {
      //       display: false,
      //     },
      //   },
      // ],
    },
  };

  const classes = useStyle();

  return (
    <Paper elevation={2} className={classes.container}>
      <div className={classes.header}>
        <p className={classes.title}>{usersDesk.DEVICE_NAME}'s Desk</p>
        <div className={classes.statusContainer}>
          <p className={classes.status}>
            {vacantBool ? "Vacant" : "Occupied"}
          </p>
          <div
            className={classes.dot}
            style={{
              backgroundColor: vacantBool ? "#B21F00" : "lightblue",
            }}
          ></div>
        </div>
      </div>
      <p className={classes.location}>{usersDesk.DEVICE_LOCATION}</p>
      <p className={classes.chartTitle}>Occupancy</p>
      <Doughnut
        data={doughnutState}
        options={{
          legend: { display: false },
          cutoutPercentage: 75,
        }}
      />
      <div className={classes.legendContainer}>
        <p className={classes.legendTitle}>Status</p>
        <div className={classes.swatchesContainer}>
          <p style={{ backgroundColor: "#B21F00", color: "white" }}>Vacant</p>
          <p style={{ backgroundColor: "lightblue" }}>Occupied</p>
        </div>
      </div>
      <p className={classes.showingLast}>{setShowingLast()}</p>
      <Bar data={cloneDeep(barState)} options={barOptions} />
      <p className={classes.timeTypeBox}>
        {timeSelection === "twentyfour" ? "Minutes" : "Hours"}
      </p>
      <WorkTimeLegend timeSelection={timeSelection} />
      <div style={{ fontSize: "0.825rem", marginTop: "1em" }}>
        <TimeSelection
          timeSelection={timeSelection}
          setTimeSelection={setTimeSelection}
        />
      </div>
    </Paper>
  );
};

export default SpacesDeskChart;

const useStyle = makeStyles((theme) => ({
  container: {
    width: "24%",
    borderRadius: "10px",
    padding: "0.75em",
    marginBottom: "2em",
    marginRight: "1em",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "1rem",
    margin: "0",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
  },
  status: {
    fontSize: "0.825rem",
    margin: "0",
  },
  dot: {
    width: "0.825rem",
    height: "0.825rem",
    borderRadius: "100px",
    marginLeft: "0.75em",
  },
  location: {
    fontSize: "1rem",
    color: "rgb(0, 212, 255)",
    fontWeight: "400",
  },
  chartTitle: {
    fontSize: "0.825rem",
    textAlign: "center",
    fontWeight: "600",
  },
  legendContainer: {
    borderBottom: "1px solid lightgray",
    marginBottom: "1em",
  },
  legendTitle: {
    fontSize: "0.825rem",
    fontWeight: "600",
    margin: "0",
  },
  swatchesContainer: {
    display: "flex",
    "& p": {
      fontSize: "0.75rem",
      fontWeight: "600",
      textAlign: "center",
      padding: "0.25em .5em",
      width: "69px",
    },
  },
  showingLast: {
    textAlign: "center",
    fontSize: "0.825rem",
    fontWeight: "600",
  },
  timeTypeBox: {
    fontSize: "0.825rem",
    fontWeight: "600",
  },
}));
