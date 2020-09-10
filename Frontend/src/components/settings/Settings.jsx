import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cloneDeep } from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import MaterialTable from "material-table";
import Tooltip from "@material-ui/core/Tooltip";
import moment from "moment";
import { setDevices } from "./../../store/reducers/settingsReducer";
import RenderIcons from "./RenderIcons";
import { getUserDevices, changeDeviceNameAndLocation } from "../../utils/API";

const Settings = () => {
  const devices = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const getOrRefreshDevices = () => {
    getUserDevices().then((resp) => {
      dispatch(setDevices(resp.data.Items));
    })
  }

  const updateHandler = (newData) => {
    let body = {
        DEVEUI: newData.DEVEUI,
        DEVICE_NAME: newData.DEVICE_NAME,
        DEVICE_LOCATION: newData.DEVICE_LOCATION
      }
    changeDeviceNameAndLocation(body)
    .then(() => getOrRefreshDevices())
    .catch((err)=> console.log("row update error ==>", err))
  }

  useEffect(() => {
    getOrRefreshDevices();
  }, [])

  const [hoveredData, setHoveredData] = useState({
    signal: null,
    anchorEl: null,
  });
  const tableState = {
    columns: [
      { title: "ID", field: "DEVEUI", editable: "never" },
      { title: "Name", field: "DEVICE_NAME", editable: "onUpdate" },
      {
        title: "Location", field: "DEVICE_LOCATION",
        render: rowData => {
          return rowData.DEVICE_LOCATION === "UNKNOWN" || !rowData.DEVICE_LOCATION ? rowData.DEVICE_NAME : rowData.DEVICE_LOCATION
        },
        editable: "onUpdate"
      },
      { title: "Type", field: "SENSOR_TYPE", editable: "never" },
      { title: "Last Message", field: "LAST_MESSAGE",
      render: rowData => {
        return moment.unix(rowData.LAST_MESSAGE).format("YYYY/MM/DD HH:mm:ss")
      },
      editable: "never" },
      {
        title: "Signal Strength",
        field: "BATTERY_PERCENTAGE",
        editable: "never",
        render: (rowData) => (
          <RenderIcons
            signal={rowData.BATTERY_PERCENTAGE}
            setHoveredData={setHoveredData}
          />
        ),
      },
    ],
  };

  const renderToolTip = () => {
    const { signal, anchorEl } = hoveredData;
    if (!anchorEl) return null;

    return (
      <Tooltip
        title={signal}
        arrow
        placement="top"
        open={Boolean(anchorEl)}
        PopperProps={{
          anchorEl,
        }}
        classes={{ tooltip: classes.tooltip }}
      >
        <div />
      </Tooltip>
    );
  };

  const classes = useStyles();
  return (
    <div className={classes.settingsContainer}>
      {renderToolTip()}
      <MaterialTable
        title="Devices"
        columns={tableState.columns}
        data={cloneDeep(devices.data)}
        options={{ paging: false }}
        editable={{
          onRowUpdate: (newData, oldData) =>{
            return new Promise((resolve) => {
              setTimeout(() => {
                updateHandler(newData)
                resolve();
              }, 600);
            })
          }
        }}
        style={{ padding: "1rem", borderRadius: "10px" }}
      />
    </div>
  );
};

export default Settings;

const useStyles = makeStyles((theme) => ({
  settingsContainer: {
    width: "80%",
  },
  tooltip: {
    fontSize: "1rem",
  },
}));
