import React, {useEffect, useState} from "react";
import { makeStyles } from "@material-ui/core/styles";
import SpacesDeskChart from "./../charts/SpacesDeskChart";
import SpacesRoomChart from "./../charts/SpacesRoomChart";
import { usersDesk, spacesRoomData, spacesRoomLabels } from "data";
import { generateXAxisObj } from "../../utils/helperFunctions"
import { getSpacesPage } from "../../utils/API";
import { setItems } from "./../../store/reducers/spacesReducer";
import { useSelector, useDispatch } from "react-redux";
import {cloneDeep} from "lodash";
import moment from "moment"

const parseSerialData = (data, hours = true) => {
  data = hours ? [data["0"], data["1"], data["2"], data["3"], data["4"], data["5"], data["6"], data["7"], data["8"], data["9"], data["10"], data["11"], data["12"], data["13"], data["14"], data["15"], data["16"], data["17"], data["18"], data["19"], data["20"], data["21"], data["22"], data["23"]] : [data["0"], data["1"], data["2"], data["3"], data["4"], data["5"], data["6"], data["7"], data["8"], data["9"], data["10"], data["11"], data["12"], data["13"], data["14"], data["15"], data["16"], data["17"], data["18"], data["19"], data["20"], data["21"], data["22"], data["23"], data["24"], data["25"], data["26"], data["27"], data["28"], data["29"]]
  const utcInt = hours ? parseInt(moment().utc().format("H")) : parseInt(moment().utc().format("D"));
  data = data.slice(utcInt + 1).concat(data.slice(0, utcInt + 1))
  return data
}

const Spaces = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const spaces = useSelector((state) => state.spaces);
  const [xAxisObj, setXAxisObj] = useState(null)

  useEffect(() => {
    getSpacesPage().then(resp => {
      console.log("resp ==>", resp)

       const parsedDesks = resp.data.DESK_OVERVIEW.map(item => { return { ...item, month: parseSerialData(item.DAILY, false), week: parseSerialData(item.DAILY, false).slice(-7), twentyfour: parseSerialData(item.HOURLY) } })
       const parsedRooms = resp.data.ROOM_OVERVIEW.map(item => { return { ...item, month: parseSerialData(item.DAILY, false), week: parseSerialData(item.DAILY, false).slice(-7), twentyfour: parseSerialData(item.HOURLY) } })
      dispatch(setItems(cloneDeep({ desks: parsedDesks, rooms: parsedRooms})));
    })

    generateXAxisObj((obj) =>setXAxisObj(obj) )
    
    const setIntervalId = setInterval(() => {
      getSpacesPage().then(resp => {
        // console.log("resp ==>", resp)
        let parsedDesks = resp.data.DESK_OVERVIEW.map(item => { return { ...item, month: parseSerialData(item.DAILY, false), week: parseSerialData(item.DAILY, false).slice(-7), twentyfour: parseSerialData(item.HOURLY) } })
        let parsedRooms = resp.data.ROOM_OVERVIEW.map(item => { return { ...item, month: parseSerialData(item.DAILY, false), week: parseSerialData(item.DAILY, false).slice(-7), twentyfour: parseSerialData(item.HOURLY) } })
        // const coinFlip = Math.round(Math.random())
        // const d20 = Math.floor(Math.random() * 20)
        //   parsedDesks[0].CURRENT_STATUS = coinFlip ? "OCCUPIED" : "VACANT"; 
        //   parsedRooms[0].CURRENT_STATUS = d20; 
        //   console.log("parsedDoors",parsedDesks);
        //   console.log("parsedRooms",parsedRooms);
        dispatch(setItems(cloneDeep({ desks: parsedDesks, rooms: parsedRooms})));
      })
      console.log("spaces tab interval called")
  
    }, 10000)
    return () => {
      console.log("clearing spaces tab interval");
      clearInterval(setIntervalId)
    }
  }, [])

  return (
    <div className={classes.container}>
      <p className={classes.sectionTitle}>Desks</p>
      <div className={classes.sectionContainer}>
        {spaces.desks.length > 0  && xAxisObj && spaces.desks.map((user, index) => {
          return (
            <SpacesDeskChart usersDesk={user} xAxisObj={xAxisObj} key={index} />
          );
        })}
      </div>
      <p className={classes.sectionTitle}>Grid-Eye</p>
      <div className={classes.sectionContainer}>
        {spaces.rooms.length > 0 && xAxisObj && spaces.rooms.map((room, index) => (
          <SpacesRoomChart data={room} xAxisObj={xAxisObj} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Spaces;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "95%",
  },
  sectionContainer: {
    display: "flex",
    flexWrap: "wrap",
  },
  sectionTitle: {
    marginLeft: "1em",
  },
}));
