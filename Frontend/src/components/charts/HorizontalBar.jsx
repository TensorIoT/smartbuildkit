import React from "react";
import { HorizontalBar, Line } from "react-chartjs-2";
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
  const classes = useStyles();

  // console.log("chartData", chartData)
  const lineChart = {
    labels: labels,
    datasets: [
      {
        label: 'My First dataset',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgb(58, 147, 158)',
        borderColor: 'rgb(58, 147, 158)',
        // backgroundColor: 'red',
        // borderColor: 'red',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderWidth: 35,
        borderJoinStyle: 'miter',
        pointBorderColor: 'transparent',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'transparent',
        pointHoverBorderColor: 'transparent',
        pointHoverBorderWidth: 0,
        pointRadius: 0,
        pointHitRadius: 0,
        spanGaps:false,
        data: chartData.open
      },
      {
        label: 'My Second dataset',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'red',
        borderColor: 'red',
        // backgroundColor: 'rgb(58, 147, 158)',
        // borderColor: 'rgb(58, 147, 158)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderWidth: 35,
        borderJoinStyle: 'miter',
        pointBorderColor: 'transparent',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'transparent',
        pointHoverBorderColor: 'transparent',
        pointHoverBorderWidth: 0,
        pointRadius: 0,
        pointHitRadius: 10,
        spanGaps:false,
        data: 
        chartData.closed
      },
    ]
  };

  const options = {
    tooltips: {
      enabled: false,
    },
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
          ticks: {
            suggestedMin: 0,
            suggestedMax: 25
        }
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
      {/* <HorizontalBar data={data} options={options} /> */}
      <Line data={lineChart} options={options}/>
    </Paper>
  );
};

export default FilledLineChart;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "31%",
    padding: "0.5em 1em",
    marginBottom: "1em",
    marginRight: "2%",
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
