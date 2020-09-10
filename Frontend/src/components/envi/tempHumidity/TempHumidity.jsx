import React from "react";
import MiniMixChart from "../../charts/MiniMixChart";
import { environmentTemperatureChartDatas } from "./../../../env_charts_data";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";

const TempHumidity = () => {
  const classes = useStyles();
  const environ = useSelector((state) => state.environ);

  const filterData = (dataArr, type) => {
    if (type === "xData") {
      let filteredArr = [];
      dataArr.forEach((item) => {
        filteredArr.push(item.x);
      });
      return filteredArr;
    } else if (type === "yData") {
      let filteredArr = [];
      dataArr.forEach((item) => {
        filteredArr.push(item.y);
      });
      return filteredArr;
    }
  };


  return (
    <div className={classes.tempHumidity}>
      <p className={classes.title}>Temperature & Humidity</p>
      <div className={classes.tempHumidityCharts}>
        {environ.devices.length > 0 && environ.devices.map(item => (

            <MiniMixChart
            status={item.CURRENT_STATUS}
            title={item.DEVICE_NAME}
            humidity={
              item.STATUS.humid
            }
            temperature={
              item.STATUS.temp
   
            }
            labels={item.STATUS.labels}
            />
            )
          )
        }
      </div>
    </div>
  );
};

export default TempHumidity;

const useStyles = makeStyles((theme) => ({
  title: {
    marginLeft: "1em",
  },
  tempHumidity: {
    width: "70%",
    marginTop: "2em",
  },
  tempHumidityCharts: {
    display: "flex",
    justifyContent: "space-between",
  },
}));
