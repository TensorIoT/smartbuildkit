import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import { LocationOn } from "@material-ui/icons";

const backgroundGradients = [
  "#0c8dbf",
  "#1fa8dc",
  "#34bef4",
  "#67cbf3",
  "#a0def6",
];

const falseStyles = {
  backgroundColor: "#0b6a94",
  color: "white",
};

const trueStyles = {
  backgroundColor: "#c7f1ff",
  color: "black",
};

const DeviceStatus = ({ device, index, isNumber }) => {
  const statusBool = device.CURRENT_STATUS === "OPEN" || device.CURRENT_STATUS === "OCCUPIED" || device.CURRENT_STATUS === "MOTION";
  const styleProps = {
    status: statusBool ? { ...trueStyles } : { ...falseStyles },
    containerBackground: backgroundGradients[index],
  };
  // TODO: cleanup implementation of number support, much cleaner way to do this but can refactor later
  if (isNumber) {
    styleProps.status.backgroundColor = backgroundGradients[index];
    styleProps.status.color = "white";
  }
  const classes = deviceStyles(styleProps);
  return (
    <div className={classes.container}>
      <LocationOn style={{ color: "white", padding: "0.3rem", fontSize: 40 }} />
      <p className={classes.deviceName}>{device.DEVICE_NAME}</p>
      <div>
        <p>{isNumber ? device.CURRENT_STATUS : statusBool ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};

const deviceStyles = makeStyles({
  container: {
    display: "flex",
    flexFlow: "row nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: (props) => props.containerBackground,
    color: "white",
    "& p": {
      fontWeight: 700,
    },
    "& div": {
      alignSelf: "stretch",
      backgroundColor: (props) => props.status.backgroundColor,
      color: (props) => props.status.color,
      fontWeight: 400,
      padding: "4px",
      maxWidth: "2.6rem",
      width: "100%",
      textAlign: "center",
      "& p": {
        fontWeight: 400,
      },
    },
  },
  deviceName: {
    marginRight: "auto",
  },
});
const arrFilter = (arr) => arr.filter(item => item !== "N/A")
const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const DeviceStatusList = ({ deviceList = [], title, subTitle }) => {
  const classes = useStyles();
  const max = deviceList.length;
  const isNumber = deviceList[0].CURRENT_STATUS === "N/A" || typeof deviceList[0].CURRENT_STATUS === "number";
  const current = isNumber
    ? arrAvg(arrFilter(deviceList.map((device) => device.CURRENT_STATUS )))
    : deviceList.filter((device) => device.CURRENT_STATUS === "OPEN" || device.CURRENT_STATUS === "OCCUPIED" || device.CURRENT_STATUS === "MOTION").length;
  return (
    <Paper elevation={2} className={classes.container}>
      <div className={classes.header}>
        <div className={classes.title}>
          {title}
          <span>{subTitle}</span>
        </div>
        <div className={classes.value}>
          <span className={classes.current}>{current}</span>
          {!isNumber && <span> / {max}</span>}
        </div>
      </div>
      {deviceList.map((device, idx) => {
        return (
          <DeviceStatus
            device={device}
            key={idx}
            index={idx}
            isNumber={isNumber}
          />
        );
      })}
    </Paper>
  );
};

export default DeviceStatusList;

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexFlow: "column wrap",
    fontSize: "0.75em",
    height: "100%",
    marginTop: "2.5rem",
    width: "20%",
    padding: "0.7rem",
    borderRadius: "10px",
  },
  header: {
    display: "flex",
    flexFlow: "row",
    justifyContent: "space-between",
    padding: "1rem 0.5rem 1.5rem",
  },
  value: {},
  title: {
    fontWeight: 700,
    display: "flex",
    flexFlow: "column wrap",
    "& span": {
      fontWeight: 400,
    },
  },
  current: {
    color: "#03aef0",
    fontWeight: 700,
    fontSize: "3rem",
    lineHeight: "1em",
    verticalAlign: "top",
  },
}));
