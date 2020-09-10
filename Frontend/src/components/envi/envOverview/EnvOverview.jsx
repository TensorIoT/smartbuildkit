import React from "react";
import { Bar } from "react-chartjs-2";
// import { envOverviewChart } from "./../../../env_charts_data";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { useSelector } from "react-redux";

const EnvOverview = () => {
  const environ = useSelector((state) => state.environ);
  const classes = useStyles();
  const data = {
    labels: environ.envAverage.labels,
    datasets: [
      {
        type: "line",
        label: "Humidity",
        data: environ.envAverage.humid,
        fill: false,
        borderColor: "black",
        backgroundColor: "black",
        yAxisID: "y-axis-2",
      },
      {
        label: "Temperature",
        backgroundColor: "#3a939e",
        borderColor: "	#3a939e",
        data: environ.envAverage.temp,
        yAxisID: "y-axis-1",
      },
    ],
  };

  const options = {
    layout: {
      padding: 30,
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
      <p className={classes.title}>Environment Overview</p>
      <div>
        <Bar data={data} options={options} />
      </div>
    </Paper>
  );
};

export default EnvOverview;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "70%",
    borderRadius: "10px",
  },
  title: {
    margin: "2.5em 0 0 2.5em",
    fontSize: "1rem",
  },
}));
