import React, { useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@material-ui/core/NativeSelect";
import Slider from "@material-ui/core/Slider";
import Paper from "@material-ui/core/Paper";

const RoomControls = () => {
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [roomData, setRoomData] = useState([
    {
      id: "f4-45-d3-h6-h6-04",
      label: "Conference Room",
      currentTemp: 24,
      targetTemp: 22,
    },
    {
      id: "g6-35-93-m5-00",
      label: "Reception Area",
      currentTemp: 23,
      targetTemp: 21,
    },
  ]);
  const classes = useStyles();

  const optionChangeHandler = (e) => setSelectedRoomIdx(e.target.value);

  const selectedRoomTemp = roomData[selectedRoomIdx].currentTemp;
  const selectedRoomTargetTemp = roomData[selectedRoomIdx].targetTemp;

  const slideHandler = (e, newValue) =>
    setRoomData((rooms) => {
      const newRoomsData = [...rooms];
      newRoomsData[selectedRoomIdx].targetTemp = newValue;
      return newRoomsData;
    });

  return (
    <Paper elevation={2} className={classes.container}>
      <p className={classes.title}>Room Controls</p>
      <div className={classes.selectContainer}>
        <NativeSelect
          value={selectedRoomIdx}
          onChange={optionChangeHandler}
          name="room"
          fullWidth
          style={{ backgroundColor: "white" }}
        >
          {roomData.map(({ label, id }, idx) => (
            <option value={idx} key={id}>
              &nbsp;&nbsp;{label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className={classes.currTempContainer}>
        <div>
          <div>Temp &deg;C</div>
          <div className={classes.subtitle}>Inside</div>
        </div>
        <div className={classes.currTempText}>{selectedRoomTemp}</div>
      </div>
      <div className={classes.targetTempContainer}>
        <p>Turn on heater when temp is below</p>
        <p className={classes.targetTemp}>{selectedRoomTargetTemp} &deg;C</p>
      </div>
      <StyledSlider
        value={selectedRoomTargetTemp}
        onChange={slideHandler}
        valueLabelDisplay="off"
        step={1}
        min={10}
        max={30}
      />
      <div className={classes.textareaContainer}>
        <textarea
          className={classes.roomTextarea}
          placeholder="Enter Custom Promo Code"
        ></textarea>
      </div>
      <div className={classes.roomBtnContainer}>
        <button className={classes.roomBtn}>Select</button>
      </div>
    </Paper>
  );
};

export default RoomControls;

const useStyles = makeStyles((theme) => ({
  container: {
    width: "25%",
    padding: "0 1rem",
    fontSize: "1rem",
    color: "white",
    borderRadius: "10px",
    backgroundColor: "#0297d1",
  },
  targetTemp: {
    margin: "0",
    fontSize: "1.6rem",
    fontWeight: "bold",
  },
  textareaContainer: {
    borderTop: "2px solid gray",
    paddingTop: "1.5em",
    marginTop: "1.5em",
  },
  roomTextarea: {
    width: "100%",
    height: "100px",
    fontSize: "0.825rem",
    resize: "none",
    "&::placeholder": {
      fontSize: "0.825rem",
    },
  },
  roomBtnContainer: {
    marginTop: "0.5em",
  },
  roomBtn: {
    width: "100%",
    height: "60px",
    backgroundColor: "rgb(113, 201, 255)",
    color: "white",
    border: "none",
    outline: "none",
    fontWeight: "700",
    fontSize: "1rem",
    "&:hover": {
      backgroundColor: "rgb(113, 229, 255)",
      cursor: "pointer",
    },
  },
  title: {
    fontSize: "1rem",
    fontWeight: "600",
  },
  selectContainer: {
    margin: "2rem 0 1rem 0",
  },
  currTempContainer: {
    marginBottom: "1.5rem",
    display: "flex",
    width: "100%",
    "& > div": {
      flex: 1,
    },
    "& > div:last-of-type": {
      textAlign: "right",
    },
  },
  subtitle: {
    color: "#a3dad9",
  },
  currTempText: {
    fontSize: "3.5rem",
    lineHeight: "3.5rem",
    fontWeight: "bold",
  },
  targetTempContainer: {
    textAlign: "center",
    "& .targetTemp": {
      fontSize: "1.6rem",
      fontWeight: "bold",
    },
    "& > span": {
      display: "inline-block",
    },
  },
}));

const StyledSlider = withStyles({
  root: {
    color: "#4d4d4d",
    height: 8,
  },
  thumb: {
    height: 18,
    width: 18,
    backgroundColor: "#3ccafe",
    marginTop: -5,
    marginLeft: -9,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  track: {
    height: 8,
  },
  rail: {
    height: 8,
    opacity: 1,
  },
})(Slider);
