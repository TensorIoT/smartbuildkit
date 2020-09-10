import React, { useState,useEffect} from "react";
import TimeSelection from "./../../timeSelection/TimeSelection";
import WorkTimeLegend from "./../deskOverview/WorkTimeLegend";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Doughnut } from "react-chartjs-2";
import { generateXAxisObj } from "../../../utils/helperFunctions"
import { getSpacesPage } from "../../../utils/API";
import { setItems } from "../../../store/reducers/spacesReducer";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment"
// import "./OccupancyAvg.css";

const parseSerialData = (data, hours = true) => {
  data = hours ? [data["0"], data["1"], data["2"], data["3"], data["4"], data["5"], data["6"], data["7"], data["8"], data["9"], data["10"], data["11"], data["12"], data["13"], data["14"], data["15"], data["16"], data["17"], data["18"], data["19"], data["20"], data["21"], data["22"], data["23"]] : [data["0"], data["1"], data["2"], data["3"], data["4"], data["5"], data["6"], data["7"], data["8"], data["9"], data["10"], data["11"], data["12"], data["13"], data["14"], data["15"], data["16"], data["17"], data["18"], data["19"], data["20"], data["21"], data["22"], data["23"], data["24"], data["25"], data["26"], data["27"], data["28"], data["29"]]
  const utcInt = hours ? parseInt(moment().utc().format("H")) : parseInt(moment().utc().format("D"));
  data = data.slice(utcInt + 1).concat(data.slice(0, utcInt + 1))
  return data
}

const OccupancyAvg = () => {
  const spaces = useSelector((state) => state.spaces);
  const [timeSelection, setTimeSelection] = useState("twentyfour");
  const [avg, setAvg] = useState(null)
  const classes = useStyles();


  const state = {
    labels: ["Occupied", "Vacant"],
    datasets: [
      {
        backgroundColor: ["lightblue", "#B21F00"],
        hoverBackgroundColor: ["#501800"],
        data: avg,
      },
    ],
  };

  useEffect(() => {
    getSpacesPage().then(resp => {

  
    let output = {occupied: 0, vacant: 0};
    let len = resp.data.DESK_OVERVIEW.length;
    resp.data.DESK_OVERVIEW.forEach(item => {
     output.occupied += item.OCCUPANCY_PERCENTAGES.OCCUPIED
     output.vacant += item.OCCUPANCY_PERCENTAGES.VACANT
    })
    output.occupied = parseInt(output.occupied /len);
    output.vacant = parseInt(output.vacant /len);
      
      setAvg([output.occupied,100 - output.occupied])

    })

    const setIntervalId = setInterval(() => {
      getSpacesPage().then(resp => {

  
        let output = {occupied: 0, vacant: 0};
        let len = resp.data.DESK_OVERVIEW.length;
        resp.data.DESK_OVERVIEW.forEach(item => {
         output.occupied += item.OCCUPANCY_PERCENTAGES.OCCUPIED
         output.vacant += item.OCCUPANCY_PERCENTAGES.VACANT
        })
        output.occupied = parseInt(output.occupied /len);
        output.vacant = parseInt(output.vacant /len);
          
          setAvg([output.occupied,100 - output.occupied])
    
        })
      console.log("occupancy average interval called ")

    }, 10000)
    return () => {
      console.log("clearing occupancy average interval");
      clearInterval(setIntervalId)
    }

  }, [])

  return (
    <Paper elevation={2} className={classes.container}>
      <p className={classes.title}>Occupancy Average</p>
      <div>
        <Doughnut
          data={state}
          height={250}
          options={{
            legend: { display: false },
            cutoutPercentage: 75,
          }}
        />
      </div>
      <div className={classes.legendContainer}>
        <p className={classes.legendTitle}>Status</p>
        <div className={classes.swatchesContainer}>
          <p style={{ backgroundColor: "#B21F00", color: "white" }}>Vacant</p>
          <p style={{ backgroundColor: "lightblue" }}>Occupied</p>
        </div>
      </div>
      {/* <div className={classes.tabs}>
        <TimeSelection
          timeSelection={timeSelection}
          setTimeSelection={setTimeSelection}
        />
      </div> */}
    </Paper>
  );
};

export default OccupancyAvg;

const useStyles = makeStyles((theme) => ({
  container: {
    borderRadius: "10px",
    width: "20%",
    padding: "1em",
    height: "40%"
  },
  title: {
    fontSize: "1rem",
  },
  legendContainer: {
    marginBottom: "1em",
  },
  timeTypeBox: {
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  tabs: {
    fontSize: "0.825rem",
    marginTop: "0.5em",
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
}));
