import moment from "moment"
import {cloneDeep} from "lodash"
import { Auth } from "aws-amplify";


export const generateXAxisObj = (cb) => {
  const nowInt = parseInt(moment().format("H"));
  const time = timeMaker(nowInt);
  const dayWeek = [moment().subtract(6, "day").format("dd"),moment().subtract(5, "day").format("dd"), moment().subtract(4, "day").format("dd"),moment().subtract(3, "day").format("dd"), moment().subtract(2, "day").format("dd"), moment().subtract(1, "day").format("dd"), moment().format("dd") ]
  let dayMonth = [moment().subtract(8, "day").format("dd"),moment().subtract(7, "day").format("dd"),...cloneDeep(dayWeek),...cloneDeep(dayWeek),...cloneDeep(dayWeek),...cloneDeep(dayWeek)];
  const timeWeek = ["AM", "PM", "AM", "PM", "AM", "PM", "AM", "PM", "AM", "PM", "AM", "PM", "AM", "PM"]
  const weekOf = [ moment().subtract(3, "week").format("M/D"),moment().subtract(2, "week").format("M/D"),moment().subtract(1, "week").format("M/D"), moment().format("M/D")]
  const all = {time,dayWeek,dayMonth,timeWeek, weekOf}
  cb(all)
}

const timeMaker = (int) => {
  let currentInt = int;
  let output = [];
  for (let i = 24; i > 0; i-- ){
    output.push( (currentInt%24 >= 0 ? currentInt%24 : 24 - Math.abs(currentInt) ))
    currentInt--;
  }
  return output.reverse();
}



export function getPreviousWorkday(){
  let workday = moment();
  let day = workday.day();
  let diff = 1;  // returns yesterday
  if (day == 0 || day == 1){  // is Sunday or Monday
    diff = day + 2;  // returns Friday
  }
  return workday.subtract(diff, 'days').format("M/D");
}

export const getUserId = async () => {
  const userInfo = await Auth.currentAuthenticatedUser();
  console.log("userInfo",userInfo)
  return userInfo.username.toUpperCase();
};