import React, { useState, createRef, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { devices } from "data";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import { mapRequest, axiosPUT} from "../../utils/API";
import OfficeMap from "./../../img/officeBlueprint.jpg";
import {
  faHandPaper,
  faThermometerHalf,
  faDoorClosed,
  faChairOffice,
  faRouter,
  faChartNetwork,
  faWarehouseAlt,
  faTint,
} from "@fortawesome/pro-light-svg-icons";
import "./Map.css";

const deviceCopy = [...devices];

const Map = () => {
  const [img, setImg] = useState(OfficeMap);
  const [editing, setEditing] = useState(false);
  const [devicesArr, setDevicesArr] = useState([]);
  const [mappedDevices, setMappedDevices] = useState([]);
  const [selectedDeviceIdx, setSelectedDeviceIdx] = useState(null);
  const [hoveredData, setHoveredData] = useState({
    iconName: null,
    anchorEl: null,
  });

  useEffect(() => {

    const getMapBody = {
      ACTION: "GETMAP"
    }
    mapRequest(getMapBody).then((resp) => {
      console.log("GETMAP URL",resp.data);
      setImg(resp.data)

    })

    const sensorBody = {
      ACTION: "GETSENSORS"
    }

    mapRequest(sensorBody)
    .then((resp) => {
      console.log(resp.data)
      const filtered = resp.data.filter(item => item.mapXCoordinate !== 0 && item.mapYCoordinate !== 0)
      const remainder = resp.data.filter(item => item.mapXCoordinate == 0 && item.mapYCoordinate == 0)
      setMappedDevices(filtered);
      setDevicesArr(remainder)
    })
  }, []);

  useEffect(() => {
    console.log("mappedDevices ===>",mappedDevices)
  },[mappedDevices])

  const imageRef = createRef();
  const classes = useStyles();

  const iconArr = [
    { name: faHandPaper, title: "Motion" },
    { name: faThermometerHalf, title: "Temp/ Humidity" },
    { name: faDoorClosed, title: "Door/ Window" },
    { name: faChairOffice, title: "Desk" },
    { name: faRouter, title: "IR Blaster" },
    { name: faChartNetwork, title: "Hub" },
    { name: faWarehouseAlt, title: "Room" },
    { name: faTint, title: "Leak" },
  ];

  const editSaveMap = () => {
    if (editing) {
      //saving changes to map
      let body = 
       {
        ACTION: "UPLOADPOINTS",
        PARAMS: mappedDevices
      }
      console.log("body.PARAMS",body.PARAMS);
      mapRequest(body).then(resp => console.log("SUCCESS",resp)).catch(err => console.log("FAIL", err))
      setEditing(false);
    } else {
      //opens up editing tools
      setSelectedDeviceIdx(null);
      setEditing(true);
    }
  };

  const calcPercent = (num, window) => {
    let total = parseFloat(((num / window) * 100).toFixed(3));
    return `${total}%`;
  };

  const placeDevices = (e) => {
    console.log(editing, selectedDeviceIdx);
    if (selectedDeviceIdx === null || editing === false) {
      return;
    } else {
      const rect = imageRef.current.getBoundingClientRect();
      let selected = devicesArr[selectedDeviceIdx];
      selected.mapXCoordinate = calcPercent(e.clientX - rect.left, rect.width);
      selected.mapYCoordinate = calcPercent(e.clientY - rect.top, rect.height);
      selected.ogIdx = selectedDeviceIdx;
      let tempArr = [...devicesArr];
      tempArr.splice(selectedDeviceIdx, 1);
      setDevicesArr(tempArr);
      setMappedDevices([...mappedDevices, selected]);
      setSelectedDeviceIdx(null);
    }
  };

  const removeDevice = (idx, ogIdx) => {
    if (!editing) {
      return;
    }
    let newMapped = [...mappedDevices];
    let newDevices = [...devicesArr];
    newMapped.splice(idx, 1);
    newDevices.splice(ogIdx, 0, mappedDevices[idx]);
    setDevicesArr(newDevices);
    setMappedDevices(newMapped);
  };

  const setIconName = (type) => {
    switch (type) {
      case "ENV":
        return faThermometerHalf;
      case "DESK":
        return faChairOffice;
      case "ROOM":
        return faWarehouseAlt;
      case "MOTION":
        return faHandPaper;
      case "LEAK":
        return faTint;
      case "DOOR":
        return faDoorClosed;
      case "GRIDEYE":
        return faChartNetwork;
      case "IR":
        return faRouter;
    }
  };

  const clearIcons = () => {
    setMappedDevices([]);
    setDevicesArr(deviceCopy);
  };

  const timeMouseEnterHandler = (iconName) => (event) => {
    event.persist();
    setHoveredData({ iconName, anchorEl: event.target });
  };

  const timeMouseLeaveHandler = () =>
    setHoveredData({ iconName: null, anchorEl: null });

  const renderToolTip = () => {
    const { iconName, anchorEl } = hoveredData;
    if (!anchorEl) return null;

    return (
      <Tooltip
        title={iconName}
        arrow
        placement="top"
        open={Boolean(anchorEl)}
        PopperProps={{
          anchorEl,
        }}
      >
        <div />
      </Tooltip>
    );
  };

  const fileSelectHandler = (e) => {
    const file = e.target.files[0];
    console.log(file);
    getBase64(file).then((base64) => {
      // clearIcons();
      
    const uploadBody = {
      ACTION: "UPLOADMAP"
    }
      mapRequest(uploadBody).then(resp => {
        console.log("uploadURL",resp.data)
        axiosPUT(resp.data, file).then(resp=> console.log("success", resp))
      }).catch(err => console.log("fetch upload url error =>", err))
      setImg(base64);
    });
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className={classes.container}>
      <Paper elevation={2} className={classes.mapContainer}>
        <div ref={imageRef} style={{ position: "relative" }}>
          <img
            src={img}
            style={{ display: "block", width: "100%" }}
            alt="office floor plan"
            onClick={(e) => placeDevices(e)}
            onError={() => setImg(OfficeMap)}
          />
          {renderToolTip()}
          {mappedDevices.map((d, i) => (
            <div
              className={`${classes.icon} ${classes.mappedIcon}`}
              key={i + d.DEVICE_NAME}
              onMouseOver={timeMouseEnterHandler(d.DEVICE_NAME)}
              onMouseLeave={timeMouseLeaveHandler}
              onClick={() => removeDevice(i, d.ogIdx)}
              style={{
                left: d.mapXCoordinate,
                top: d.mapYCoordinate,
              }}
            >
              <FontAwesomeIcon icon={setIconName(d.SENSOR_TYPE)} />
            </div>
          ))}
        </div>
        <div className={classes.mapLegend}>
          {iconArr.map((icon, idx) => (
            <div className={classes.iconContainer} key={idx}>
              <FontAwesomeIcon icon={icon.name} size={"2x"} />
              <p style={{ fontSize: "0.75rem" }}>{icon.title}</p>
            </div>
          ))}
        </div>
      </Paper>
      <Paper className={classes.sidebar}>
        <p className={classes.title} style={{ marginTop: "0" }}>
          Map
        </p>
        <button
          className={`${classes.btn} ${classes.editBtn}`}
          onClick={editSaveMap}
        >
          {editing ? "Save Map" : "Edit Map"}
        </button>
        {editing && (
          <div>
            <input
              type="file"
              name="file"
              id="file"
              className="custom-file-input"
              onChange={fileSelectHandler}
              // ref={(fileInput) => (this.fileInput = fileInput)}
            />
            <label htmlFor="file">Replace Image</label>
            {/* <button
              className={`${classes.btn} ${classes.replaceBtn}`}
              onClick={() => this.fileInput.click()}
            >
              Replace Image
            </button> */}
            {mappedDevices.length > 0 && (
              <button
                className={`${classes.btn} ${classes.clearBtn}`}
                onClick={clearIcons}
              >
                Clear All Icons from Map
              </button>
            )}
            <p className={classes.imgRequirements}>PNG, JPG up to 12MB</p>
            <div className={classes.devicesSection}>
              <p className={classes.title}>Available</p>
              <p style={{ fontSize: "0.825rem", padding: "0 1.5em" }}>
                Select a device from the list and click a map location to place.
                Click a placed device to remove
              </p>
            </div>
          </div>
        )}
        {!editing && <p className={classes.title}>Not shown</p>}
        <div className={classes.devicesContainer}>
          {devicesArr.map((devices, idx) => (
            <div
              className={classes.deviceContainer}
              key={idx}
              onClick={() => setSelectedDeviceIdx(idx)}
            >
              <div className={classes.icon} style={{ marginBottom: "0.5em" }}>
                <FontAwesomeIcon
                  icon={setIconName(devices.SENSOR_TYPE)}
                  draggable="true"
                />
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", marginLeft: ".5em" }}>
                  {devices.DEVICE_NAME}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
};

export default Map;

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
  },
  mapContainer: {
    width: "60%",
    padding: "2em",
    marginRight: "1em",
  },
  sidebar: {
    width: "20%",
    height: "100%",
  },
  title: {
    display: "flex",
    alignItems: "center",
    paddingLeft: "1em",
    height: "3rem",
    backgroundColor: "#E9F4FC",
  },
  btn: {
    width: "90%",
    height: "50px",
    margin: "0 5%",
    color: "white",
    border: "none",
    borderRadius: "3px",
    outline: "none",
    fontWeight: "700",
    fontSize: "1rem",
    "&:hover": {
      cursor: "pointer",
    },
  },
  editBtn: {
    marginBottom: "1em",
    backgroundColor: "rgb(113, 201, 255)",
    "&:hover": {
      backgroundColor: "rgb(113, 229, 255)",
    },
  },
  replaceBtn: {
    marginBottom: "1em",
    backgroundColor: "rgb(150, 150, 150)",
    "&:hover": {
      backgroundColor: "rgb(170, 170, 170)",
    },
  },
  clearBtn: {
    marginTop: "1em",
    backgroundColor: "rgb(255, 45, 25)",
    "&:hover": {
      backgroundColor: "rgb(170, 170, 170)",
    },
  },
  imgRequirements: {
    fontSize: "0.825rem",
    textAlign: "center",
  },
  mapLegend: {
    display: "flex",
    justifyContent: "space-between",
    width: "80%",
    margin: "1em auto 0 auto",
  },
  iconContainer: {
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  devicesContainer: {
    paddingLeft: "1em",
  },
  deviceContainer: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    backgroundColor: "rgba(113, 201, 255, .7)",
    border: "2px solid white",
    borderRadius: "50% 50% 0 50%",
    height: "40px",
    width: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "&:hover": {
      cursor: "pointer",
    },
  },
  mappedIcon: {
    position: "absolute",
    transform: "translate(-40px,-40px)",
  },
}));
