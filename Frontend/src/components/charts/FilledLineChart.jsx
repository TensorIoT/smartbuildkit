import React from "react";
import { Line } from "react-chartjs-2";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

const FilledLineChart = ({
  labels,
  color,
  chartData,
  title,
  status,
  statusColor,
  location,
}) => {
  console.log(statusColor);
  const classes = useStyles();
  const data = {
    labels: labels,
    datasets: [
      {
        type: "line",
        fill: true,
        backgroundColor: color,
        data: chartData,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    layout: {
      padding: 0,
    },
    legend: {
      display: false,
    },
    responsive: true,
    elements: {
      line: {
        fill: false,
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          display: false,
        },
      ],
    },
  };
  return (
    <Paper elevation={2} className={classes.container}>
      <div className={classes.header}>
        <div>
          <p className={classes.title}>{title}</p>
        </div>
        <div className={classes.statusContainer}>
          <p className={classes.status}>{status}</p>
          <div
            style={{ backgroundColor: statusColor }}
            className={classes.statusDot}
          ></div>
        </div>
      </div>
      <p className={classes.location}>{location}</p>
      <Line data={data} options={options} />
    </Paper>
  );
};

export default FilledLineChart;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "31%",
    padding: "0.5em 1em",
    borderRadius: "10px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "1rem",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
  },
  status: {
    fontSize: "0.825rem",
  },
  statusDot: {
    width: "0.825rem",
    height: "0.825rem",
    borderRadius: "100px",
    opacity: "0.9",
    marginLeft: "1rem",
  },
  location: {
    fontSize: "0.825rem",
    color: "lightblue",
    margin: "0",
    fontWeight: "700",
  },
}));
