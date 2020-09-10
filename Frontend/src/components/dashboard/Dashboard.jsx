import React, { useEffect, Fragment, useState } from "react";
import DeskOverview from "./deskOverview/DeskOverview";
import OccupancyAvg from "./occupancyAvg/OccupancyAvg";
import DeviceStatusList from "components/cards/DeviceStatusList";
import { getDashboardPage } from "../../utils/API";
import { setItems, setPartial } from "./../../store/reducers/dashboardReducer";
import { useSelector, useDispatch } from "react-redux";
import { cloneDeep } from "lodash"
import moment from "moment"

const parseSerialData = (data, hours = true) => {
  data = hours ? [data["0"], data["1"], data["2"], data["3"], data["4"], data["5"], data["6"], data["7"], data["8"], data["9"], data["10"], data["11"], data["12"], data["13"], data["14"], data["15"], data["16"], data["17"], data["18"], data["19"], data["20"], data["21"], data["22"], data["23"]] : [data["0"], data["1"], data["2"], data["3"], data["4"], data["5"], data["6"], data["7"], data["8"], data["9"], data["10"], data["11"], data["12"], data["13"], data["14"], data["15"], data["16"], data["17"], data["18"], data["19"], data["20"], data["21"], data["22"], data["23"], data["24"], data["25"], data["26"], data["27"], data["28"], data["29"]]
  const utcInt = hours ? parseInt(moment.utc().format("H")) : parseInt(moment().utc().format("D"));
  data = data.slice(utcInt + 1).concat(data.slice(0, utcInt + 1))
  return data
}

const Dashboard = () => {
  const dispatch = useDispatch();
  const dash = useSelector((state) => state.dash);

  useEffect(() => {
    getDashboardPage().then(resp => {
      console.log("resp ==>", resp)
      const parsedOverview = resp.data.DESK_OVERVIEW.map(item => { return { ...item, month: parseSerialData(item.DAILY, false), week: parseSerialData(item.DAILY, false).slice(-7), twentyfour: parseSerialData(item.HOURLY) } })
      dispatch(setItems(cloneDeep({ overview: parsedOverview, rooms: resp.data.ROOMS, desks: resp.data.DESKS, doors: resp.data.DOORS, envs: resp.data.ENVS })));
    }).catch(err => console.log('error calling getDashboardPage in Dashboard component: ', err));
    const setIntervalId = setInterval(() => {
      getDashboardPage().then(resp => {
        // const coinFlip = Math.round(Math.random())
        // let newRooms = resp.data.ROOMS;
        // newRooms[0].CURRENT_STATUS = coinFlip ? "MOTION" : "NO MOTION"; 
        // console.log("interval: newRooms ==>", newRooms)

        // const d20 = Math.floor(Math.random() * 20)
        // let newEnvs = resp.data.ENVS;
        // newEnvs[0].CURRENT_STATUS = d20; 
        // console.log("interval: newEnvs ==>", newEnvs)
        dispatch(setPartial(cloneDeep({ rooms: resp.data.ROOMS, desks: resp.data.DESKS, doors: resp.data.DOORS, envs: resp.data.ENVS })));
      })
      console.log("dashboard tab interval called ")

    }, 10000)
    return () => {
      console.log("clearing dashboard tab interval");
      clearInterval(setIntervalId)
    }
  }, [])




  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <DeskOverview />
      <OccupancyAvg />
      {dash.rooms.length > 0 &&
        <DeviceStatusList
          deviceList={dash.rooms}
          title="Rooms"
          subTitle={"Occupied"}
        />
      }
      {dash.desks.length > 0 &&
        <DeviceStatusList
          deviceList={dash.desks}
          title="Desks"
          subTitle={"Occupied"}
        />
      }

      {dash.doors.length > 0 &&
        <DeviceStatusList
          deviceList={dash.doors}
          title="Doors"
          subTitle={"Open"}
        />
      }

      {dash.envs.length > 0 &&
        <DeviceStatusList deviceList={dash.envs} title="Temp °C" subTitle={"Avg"} />
      }
    </div>
  );
};

export default Dashboard;
