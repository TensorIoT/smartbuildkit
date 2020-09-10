import React from "react";
import SignalCellular0BarIcon from "@material-ui/icons/SignalCellular0Bar";
import SignalCellular1BarIcon from "@material-ui/icons/SignalCellular1Bar";
import SignalCellular2BarIcon from "@material-ui/icons/SignalCellular2Bar";
import SignalCellular3BarIcon from "@material-ui/icons/SignalCellular3Bar";
import SignalCellular4BarIcon from "@material-ui/icons/SignalCellular4Bar";

const RenderIcons = ({ signal, setHoveredData }) => {
  const getSignalIcon = (signal) => {
    if (signal >= -24) {
      return (
        <SignalCellular4BarIcon
          onMouseOver={timeMouseEnterHandler(signal)}
          onMouseLeave={timeMouseLeaveHandler}
        />
      );
    } else if (signal >= -49) {
      return (
        <SignalCellular3BarIcon
          onMouseOver={timeMouseEnterHandler(signal)}
          onMouseLeave={timeMouseLeaveHandler}
        />
      );
    } else if (signal >= -74) {
      return (
        <SignalCellular2BarIcon
          onMouseOver={timeMouseEnterHandler(signal)}
          onMouseLeave={timeMouseLeaveHandler}
        />
      );
    } else if (signal >= -99) {
      return (
        <SignalCellular1BarIcon
          onMouseOver={timeMouseEnterHandler(signal)}
          onMouseLeave={timeMouseLeaveHandler}
        />
      );
    } else {
      return (
        <SignalCellular0BarIcon
          onMouseOver={timeMouseEnterHandler(signal)}
          onMouseLeave={timeMouseLeaveHandler}
        />
      );
    } 
  };

  const timeMouseEnterHandler = (amnt, type) => (event) => {
    event.persist();
    if (type === "%") {
      let signalToStr = `${amnt.toString()} %`;
      setHoveredData({ signal: signalToStr, anchorEl: event.target });
    } else {
      let signalToStr = `${amnt.toString()} dBm`;
      setHoveredData({ signal: signalToStr, anchorEl: event.target });
    }
  };

  const timeMouseLeaveHandler = () =>
    setHoveredData({ signal: null, anchorEl: null });

  return <div>{getSignalIcon(signal)}</div>;
};

export default RenderIcons;
