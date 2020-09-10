import React from "react";
import { Line } from "react-chartjs-2";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

const MiniMixChart = (props) => {
  const classes = useStyles();
  const data = {
    labels: props.labels,
    datasets: [
      {
        type: "line",
        label: "Humidity",
        data: props.humidity,
        fill: false,
        borderColor: "black",
        backgroundColor: "black",
        yAxisID: "y-axis-2",
      },
      {
        type: "line",
        label: "Temperature",
        fill: true,
        backgroundColor: "#3a939e",
        borderColor: "	#3a939e",
        data: props.temperature,
        yAxisID: "y-axis-1",
      },
    ],
  };

  const options = {
    layout: {
      padding: 0,
    },
    responsive: true,
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
            display: true,
            labelString: "Last 24 Hours",
            fontSize: 14,
            fontStyle: "bold",
          },
          display: true,
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            padding: 10,
            min: 0,
          },
          scaleLabel: {
            display: true,
            labelString: "Temperature (°C)",
            fontSize: 14,
            fontStyle: "bold",
          },
          type: "linear",
          display: true,
          position: "left",
          id: "y-axis-1",
          gridLines: {
            display: false,
          },
        },
        {
          ticks: {
            padding: 10,
            min: 0,
          },
          scaleLabel: {
            display: true,
            labelString: "Humidity (%)",
            fontSize: 14,
            fontStyle: "bold",
          },
          type: "linear",
          display: true,
          position: "right",
          id: "y-axis-2",
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };
  return (
    <Paper elevation={2} className={classes.container}>
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <p className={classes.title}>{props.title}</p>
        </div>
        <div className={classes.headerRight}>
          <p className={classes.active}>{props.status === "N/A" ? "Not Active":"Active"}</p>
          <div className={props.status !== "N/A" ? classes.dot : classes.undot}></div>
        </div>
      </div>
      <section className={classes.temp}>
        <div className={classes.tempText}>
          <p>Temp °C</p>
          <p>Inside</p>
        </div>
        <div className={classes.tempActual}>
          {/* <p>{props.temperature[props.temperature.length - 1]}</p> */}
          <p>{props.status === "N/A" ? 0 : props.status}</p>
        </div>
      </section>
      <div>
        <Line data={data} options={options} />
      </div>
    </Paper>
  );
};

export default MiniMixChart;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "48%",
    padding: "0.5em 1em",
    borderRadius: "10px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "1rem",
  },
  active: {
    fontSize: "0.825rem",
  },
  headerLeft: {
    width: "40%",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  dot: {
    backgroundColor: "lightblue",
    width: "0.825rem",
    height: "0.825rem",
    borderRadius: "100px",
    opacity: "0.9",
    marginLeft: "1rem",
  },
  undot: {
    backgroundColor: "red",
    width: "0.825rem",
    height: "0.825rem",
    borderRadius: "100px",
    opacity: "0.9",
    marginLeft: "1rem",
  },
  temp: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1em",
  },
  tempText: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#3a939e",
    "& p": {
      marginTop: "0.5em",
      marginBottom: "0.5em",
    },
  },
  tempActual: {
    "& p": {
      margin: "0",
      fontSize: "5rem",
      fontWeight: "700",
      color: "#3a939e",
    },
  },
}));
