import React, { useEffect, useState} from "react";
import { makeStyles } from "@material-ui/core/styles";
import HorizontalBar from "../../charts/HorizontalBar";
import { useSelector } from "react-redux";


const LeakDetection = () => {
  const classes = useStyles();
  const leaks = useSelector((state) => state.environ.leaks);
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if(leaks.length > 0){
      setReady(true)
    }
  },[leaks])
  return (
    <div className={classes.container}>
      <p className={classes.title}>Leak Detection</p>
      <div className={classes.chartsContainer}>
      {ready && leaks.map((item) => {
          return (
            <HorizontalBar
              labels={item.STATUS.labels}
              color={["red", "#3a939e"]}
              chartData={item.STATUS}
              title={item.DEVICE_NAME}
              status={item.CURRENT_STATUS === "LEAK" ? "Leak": "No Leak"}
              statusColor={item.CURRENT_STATUS === "LEAK"  ? "red" : "#3a939e"}
              location={item.DEVICE_LOCATION}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LeakDetection;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "85%",
    marginTop: "2em",
  },
  title: {
    marginLeft: "1em",
  },
  chartsContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
}));
