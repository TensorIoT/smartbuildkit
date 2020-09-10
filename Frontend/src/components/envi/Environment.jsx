import React, {useEffect}from "react";
import EnvOverview from "./envOverview/EnvOverview";
import RoomControls from "./roomControls/RoomControls";
import TempHumidity from "./tempHumidity/TempHumidity";
import LeakDetection from "./leakDetection/LeakDetection";
import { useDispatch } from "react-redux";
import { getEnvPage } from "../../utils/API";
import { setItems } from "./../../store/reducers/environmentReducer";
import {cloneDeep} from "lodash";
import moment from "moment";


const mockLeaks = [
  {
    "DEVEUI": "58-A0-CB-00-00-10-3E-D0",
    "DEVICE_NAME": "TEST 1",
    "DEVICE_LOCATION": "UNKNOWN",
    "CURRENT_STATUS": "LEAK",
    "STATUS": {
      "0": {
        "LEAK": 0
      },
      "1": {
        "LEAK": 0
      },
      "2": {
        "LEAK": 0
      },
      "3": {
        "LEAK": 0
      },
      "4": {
        "LEAK": 0
      },
      "5": {
        "LEAK": 0
      },
      "6": {
        "LEAK": 0
      },
      "7": {
        "LEAK": 0
      },
      "8": {
        "LEAK": 1
      },
      "9": {
        "LEAK": 1
      },
      "10": {
        "LEAK": 1
      },
      "11": {
        "LEAK": 0
      },
      "12": {
        "LEAK": 0
      },
      "13": {
        "LEAK": 0
      },
      "14": {
        "LEAK": 1
      },
      "15": {
        "LEAK": 0
      },
      "16": {
        "LEAK": 0
      },
      "17": {
        "LEAK": 0
      },
      "18": {
        "LEAK": 0
      },
      "19": {
        "TEMP": 0
      },
      "20": {
        "LEAK": 1
      },
      "21": {
        "LEAK": 0
      },
      "22": {
        "LEAK": 0
      },
      "23": {
        "LEAK": 1
      }
    }
  },
  {
    "DEVEUI": "58-A0-CB-00-00-10-3E-D0",
    "DEVICE_NAME": "TEST 2",
    "DEVICE_LOCATION": "UNKNOWN",
    "CURRENT_STATUS": "NO LEAK",
    "STATUS": {
      "0": {
        "LEAK": 1
      },
      "1": {
        "LEAK": 0
      },
      "2": {
        "LEAK": 0
      },
      "3": {
        "LEAK": 0
      },
      "4": {
        "LEAK": 0
      },
      "5": {
        "LEAK": 0
      },
      "6": {
        "LEAK": 0
      },
      "7": {
        "LEAK": 1
      },
      "8": {
        "LEAK": 1
      },
      "9": {
        "LEAK": 1
      },
      "10": {
        "LEAK": 1
      },
      "11": {
        "LEAK": 0
      },
      "12": {
        "LEAK": 0
      },
      "13": {
        "TEMP": 0
      },
      "14": {
        "LEAK": 0
      },
      "15": {
        "LEAK": 0
      },
      "16": {
        "LEAK": 0
      },
      "17": {
        "LEAK": 0
      },
      "18": {
        "LEAK": 0
      },
      "19": {
        "LEAK": 0
      },
      "20": {
        "LEAK": 0
      },
      "21": {
        "LEAK": 0
      },
      "22": {
        "LEAK": 0
      },
      "23": {
        "LEAK": 0
      }
    }
  },
]


const labelsMaker = (int) => {
  let currentInt = int;
  let output = [];
  for (let i = 24; i > 0; i-- ){
    output.push( (currentInt%24 >= 0 ? currentInt%24 : 24 - Math.abs(currentInt) )  + ":00")
    currentInt--;
  }

  return output.reverse();
}

const parseLineData = (data) => {
  data = [data["0"].LEAK, data["1"].LEAK, data["2"].LEAK, data["3"].LEAK, data["4"].LEAK, data["5"].LEAK, data["6"].LEAK, data["7"].LEAK, data["8"].LEAK, data["9"].LEAK, data["10"].LEAK, data["11"].LEAK, data["12"].LEAK, data["13"].LEAK, data["14"].LEAK, data["15"].LEAK, data["16"].LEAK, data["17"].LEAK, data["18"].LEAK, data["19"].LEAK, data["20"].LEAK, data["21"].LEAK, data["22"].LEAK, data["23"].LEAK]
  const originalData = data.map((item, index) => {return {[index]: item}});
  let labels = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]; 
  console.log("raw parseLineData input", data)
  const utcInt = parseInt(moment.utc().format("H")) 
  const localNowInt = parseInt(moment().format("H")) 
  data = data.slice(utcInt + 1).concat(data.slice(0, utcInt + 1))
  const parsedOriginalData = originalData.slice(utcInt + 1).concat(data.slice(0, utcInt + 1))
  console.log("parsedOriginalData",parsedOriginalData)
  labels = labels.slice(localNowInt + 1).concat(labels.slice(0, localNowInt + 1))
  let newLabels = [];
  let open = [], closed = [];

  for (let i = 0; i < data.length; i++){
      open.push(data[i] === 1 ? 3 : null)
      closed.push(data[i] === 1 ? null : 17)
      open.push(data[i] === 1 ? 3 : null)
      closed.push(data[i] === 1 ? null : 17)
      newLabels.push(labels[i])
      newLabels.push(labels[i])
  }

console.log("open closed labels", {open, closed, labels})
  return {open : closed, closed: open, labels: newLabels}
}

const parseEnvironData = data => {
  data = [data["0"], data["1"], data["2"],data["3"],data["4"],data["5"],data["6"],data["7"],data["8"],data["9"],data["10"],data["11"],data["12"],data["13"],data["14"],data["15"],data["16"],data["17"],data["18"],data["19"],data["20"],data["21"],data["22"],data["23"] ];
  const utcInt = parseInt(moment().utc().format("H")) 
  const localNowInt = parseInt(moment().format("H")) 
  data = data.slice(utcInt + 1).concat (data.slice(0, utcInt + 1))

  return {temp: data.map(item => item.TEMP), humid: data.map(item => item.HUMIDITY), labels: labelsMaker(localNowInt)}
}

const Environment = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    getEnvPage().then((resp) => {
      console.log("Environment resp", resp)
      const parsedAverage =  parseEnvironData(resp.data.ENVAVERAGE);
      const parsedDevices =  resp.data.ENVS.map(item => {return {...item, STATUS: parseEnvironData(item.STATUS)}});
      const leakResp = resp.data.LEAKS.length > 0 ? resp.data.LEAKS: mockLeaks;
      const parsedLeaks = leakResp.map((leak) => {
        return {...leak, STATUS: parseLineData(leak.STATUS)}
      })

      dispatch(setItems({envAverage:parsedAverage, devices:parsedDevices, leaks: parsedLeaks }))
    })
    const setIntervalId = setInterval(() => {
      getEnvPage().then((resp) => {
      console.log("Environment interval resp", resp)
      const parsedAverage =  parseEnvironData(resp.data.ENVAVERAGE);
      const parsedDevices =  resp.data.ENVS.map(item => {return {...item, STATUS: parseEnvironData(item.STATUS)}});
      const leakResp = resp.data.LEAKS.length > 0 ? resp.data.LEAKS: mockLeaks;
      const parsedLeaks = leakResp.map((leak) => {
        return {...leak, STATUS: parseLineData(leak.STATUS)}
      })
      dispatch(setItems(cloneDeep({envAverage:parsedAverage, devices:parsedDevices, leaks: parsedLeaks })))
      })
      console.log("environment tab interval called")
  
    }, 10000)
    return () => {
      console.log("clearing environment tab interval");
      clearInterval(setIntervalId)
    }
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <EnvOverview />
        {/* <RoomControls /> */}
      </div>
      <div>
        <TempHumidity />
        <LeakDetection />
      </div>
    </div>
  );
};

export default Environment;
