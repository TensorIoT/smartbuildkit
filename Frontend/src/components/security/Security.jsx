import React, { useEffect, useState } from "react";
import HorizontalBar from "./../charts/HorizontalBar";
import { makeStyles } from "@material-ui/core/styles";
import { cloneDeep } from "lodash";
import { getSecurityLogs } from "../../utils/API";
import { setItems } from "./../../store/reducers/securityReducer";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

const parseLineData = (data) => {
  data = [data["0"], data["1"], data["2"], data["3"], data["4"], data["5"], data["6"], data["7"], data["8"], data["9"], data["10"], data["11"], data["12"], data["13"], data["14"], data["15"], data["16"], data["17"], data["18"], data["19"], data["20"], data["21"], data["22"], data["23"]]
  let labels = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]; 
  const utcInt = parseInt(moment.utc().format("H")) 
  const localNowInt = parseInt(moment().format("H")) 
  data = data.slice(utcInt + 1).concat(data.slice(0, utcInt + 1))
  labels = labels.slice(localNowInt + 1).concat(labels.slice(0, localNowInt + 1))
  let newLabels = []
  let open = [], closed = [];

  for (let i = 0; i < data.length; i++){
      open.push(data[i] === "OPEN"  || data[i] === "MOTION" ? 3 : null)
      closed.push(data[i] === "OPEN" || data[i] === "MOTION"? null : 17)
      open.push(data[i] === "OPEN" || data[i] === "MOTION"? 3 : null)
      closed.push(data[i] === "OPEN" || data[i] === "MOTION"? null : 17)
      newLabels.push(labels[i])
      newLabels.push(labels[i])
  }
  
  return {open, closed, labels:newLabels}
}

const Security = ({ userId }) => {
   const doorsAndRooms = useSelector((state) => state.security);
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getSecurityLogs()
      .then( async (resp) => {
        console.log("SECURITY resp >>>>>>>>", resp)
        
        let parsedDoors = resp.data.DOORS.map((door) => {
          return {...door, STATUS: parseLineData(door.STATUS)}
        })
        let parsedRooms = resp.data.ROOMS.map((room) => {
          return {...room, STATUS: parseLineData(room.STATUS)}
        })
        dispatch(setItems(cloneDeep({DOORS:parsedDoors, ROOMS: parsedRooms })))
      })
      const setIntervalId = setInterval(() => {
        getSecurityLogs()
        .then( async (resp) => {
          let parsedDoors = resp.data.DOORS.map((door) => {
            return {...door, STATUS: parseLineData(door.STATUS)}
          })
          let parsedRooms = resp.data.ROOMS.map((room) => {
            return {...room, STATUS: parseLineData(room.STATUS)}
          })
          // const coinFlip = Math.round(Math.random())
          // parsedDoors[0].CURRENT_STATUS = coinFlip ? "OPEN" : "CLOSED"; 
          // parsedRooms[0].CURRENT_STATUS = coinFlip ? "MOTION" : "NO MOTION"; 
          // console.log("coinFlip",coinFlip)
          // console.log("parsedDoors",parsedDoors);
          // console.log("parsedRooms",parsedRooms);
          dispatch(setItems(cloneDeep({DOORS:parsedDoors, ROOMS: parsedRooms })))
        })
        console.log("security tab interval called")
    
      }, 10000)
      return () => {
        console.log("clearing security tab interval");
        clearInterval(setIntervalId)
      }
  },[])


useEffect(() => {
  if(doorsAndRooms.rooms.length > 0){
    setReady(true)
  }
},[doorsAndRooms])

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <p className={classes.sectionTitle}>Doors and Windows</p>
      <div className={classes.sectionContainer}>
        {ready && doorsAndRooms.doors.map((item) => {
          return (
            <HorizontalBar
              labels={item.STATUS.labels}
              color={["red", "#3a939e"]}
              chartData={item.STATUS}
              title={item.DEVICE_NAME}
              status={item.CURRENT_STATUS === "CLOSED" ? "Closed": "Open"}
              statusColor={item.CURRENT_STATUS === "CLOSED"  ? "red" :"#3a939e" }
              location={item.DEVICE_LOCATION}
            />
          );
        })}
      </div>
      <p className={classes.sectionTitle}>Motion</p>
      <div className={classes.sectionContainer}>
        {ready && doorsAndRooms.rooms.map((item) => {
          return (
            <HorizontalBar
              labels={item.STATUS.labels}
              color={["red", "#3a939e"]}
              chartData={item.STATUS}
              title={item.DEVICE_NAME}
              status={item.CURRENT_STATUS === "MOTION" ? "Motion" : "No Motion"}
              statusColor={item.CURRENT_STATUS === "MOTION" ? "#3a939e": "red"}
              location={item.DEVICE_LOCATION}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Security;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "85%",
  },
  sectionContainer: {
    display: "flex",
    flexWrap: "wrap",
  },
  sectionTitle: {
    marginLeft: "1em",
  },
}));
