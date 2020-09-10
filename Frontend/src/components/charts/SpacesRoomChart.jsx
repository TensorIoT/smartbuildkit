import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import TimeSelection from "./../timeSelection/TimeSelection";
import WorkTimeLegend from "./../dashboard/deskOverview/WorkTimeLegend";
import { getPreviousWorkday } from "../../utils/helperFunctions";
import { cloneDeep } from "lodash";
import moment from "moment";

const SpacesRoomChart = ({ data, xAxisObj }) => {
  const [timeSelection, setTimeSelection] = useState("twentyfour");
  const [lastWorkingDay, setLastWorkingDay] = useState("");
  const [weekOf, setWeekOf] = useState("");


  const classes = useStyles();
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

  const chartData = {
    labels:    timeSelection === "twentyfour"
    ? xAxisObj.time
    : timeSelection === "week"
      ? xAxisObj.dayWeek
      : xAxisObj.dayMonth,
    datasets: [
      {
        label: "Occupancy",
        backgroundColor: "#3a939e",
        borderColor: "	#3a939e",
        data: data[timeSelection],
        yAxisID: "y-axis-1",
        // xAxisID: "xAxis1",
      },
          // {
      //   type: "line",
      //   label: "Utilization Time",
      //   data: data.utilTime[timeSelection],
      //   fill: false,
      //   borderColor: "black",
      //   backgroundColor: "black",
      //   yAxisID: "y-axis-2",
      //   // xAxisID: "xAxis2",
      // },
    ],
  };

  const options = {
    responsive: true,
    legend: {
      display: false,
    },
    tooltips: {
      mode: "label",
    },
    elements: {
      line: {
        fill: false,
      },
    },
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: false,
            labelString: "Last 24 Hours",
          },
          display: true,
          gridLines: {
            display: false,
          },
          ticks: {
            fontSize: 10,
            callback: (label) => {
              if (timeSelection === "week") {
                let day = label.split("-")[0];
                return day;
              } else {
                return label;
              }
            },
          },
        },
        // {
        //   gridLines: {
        //     drawBorder: false,
        //   },
        //   ticks: {
        //     padding: 1,
        //     fontSize: 10,
        //     callback: (label) => {
        //       if (timeSelection === "week") {
        //         let time = label.split("-")[1];
        //         return time;
        //       }
        //     },
        //   },
        // },
      ],
      yAxes: [
        {
          ticks: {
            padding: 10,
            min: 0,
          },
          scaleLabel: {
            display: true,
            labelString: "Occupancy (# of people)",
          },
          type: "linear",
          display: true,
          position: "right",
          id: "y-axis-1",
          gridLines: {
            display: true,
          },
        },
        // {
        //   ticks: {
        //     padding: 10,
        //     min: 0,
        //   },
        //   scaleLabel: {
        //     display: true,
        //     labelString: "Utilization Time",
        //   },
        //   type: "linear",
        //   display: true,
        //   position: "left",
        //   id: "y-axis-2",
        //   gridLines: {
        //     display: false,
        //   },
        // },
      ],
    },
  };
  // console.log("spacesRoomChart Data ==>", data)
  return (
    <Paper className={classes.container}>
      <div className={classes.header}>
        <p className={classes.title}>{data.DEVICE_NAME}</p>
        <div className={classes.statusContainer}>
          <SupervisorAccountIcon />
          <p className={classes.statusAmt}>{data.CURRENT_STATUS}</p>
          <div
            className={classes.dot}
            style={{ backgroundColor: data.CURRENT_STATUS > 0 ? "lightblue" : "red" }}
          ></div>
          <p className={classes.status}>
            {data.CURRENT_STATUS > 0 ? "Occupied": "Vacant"}
          </p>
        </div>
      </div>
      <p className={classes.showingLast}>{setShowingLast()}</p>
      <Bar data={cloneDeep(chartData)} options={options} />
      <p
        style={{
          fontSize: "0.75rem",
          textAlign: "center",
          marginTop: "0",
          fontWeight: "300",
        }}
      >
        Operational Hours
      </p>
      {/* <p className={classes.timeTypeBox}>
        {timeSelection === "twentyfour" ? "Minutes" : "Hours"}
      </p> */}
      {/* <WorkTimeLegend /> */}
      <div style={{ fontSize: "0.825rem", marginTop: "1em" }}>
        <TimeSelection
          timeSelection={timeSelection}
          setTimeSelection={setTimeSelection}
        />
      </div>
    </Paper>
  );
};

export default SpacesRoomChart;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "46%",
    borderRadius: "10px",
    padding: "0.75em",
    marginBottom: "2em",
    marginRight: "1em",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "1rem",
    margin: "0",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
  },
  statusAmt: {
    fontSize: "0.825rem",
  },
  status: {
    fontSize: "0.825rem",
    margin: "0",
  },
  dot: {
    width: "0.825rem",
    height: "0.825rem",
    borderRadius: "100px",
    marginLeft: "1em",
    marginRight: "0.5em",
  },
  location: {
    fontSize: "1rem",
    color: "rgb(0, 212, 255)",
    fontWeight: "400",
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
