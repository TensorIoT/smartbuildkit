import axios from "axios";
import { Auth } from "aws-amplify";

const endpoint = "<api gateway endpoint>/sbk"

const getUserId = async () => {
  const userInfo = await Auth.currentAuthenticatedUser();
  console.log("userInfo",userInfo)
  return userInfo.username.toUpperCase();
};

export const getCognitoToken = async () => {
  const userToken = await Auth.currentSession();
  const id = userToken.getIdToken();
  const jwt = id.getJwtToken();
  // console.log('jwt: ', jwt);
  return jwt;
};

export const getUserDevices = async () => {
  const body = 
  {
  //  USERID: await getUserId()
  }
  const token = await getCognitoToken();
  const reqConfig = {
    headers: {
      authorization: token,
    }
  };
  return axios.post(endpoint + "/devices/getuserdevices", JSON.stringify(body), reqConfig);
}

export const changeDeviceNameAndLocation = async (body) => {
  const { DEVEUI, DEVICE_NAME, DEVICE_LOCATION }  = body; 
  // body.USERID = await getUserId();
  const token = await getCognitoToken();
  const reqConfig = {
    headers: {
      authorization: token,
    }
  };
  // ex.
  // {
  //   USERID: "KARTHIK" 
  //   DEVEUI: "58-A0-CB-00-00-11-3F-9B",
  //   DEVICE_NAME: "58-A0-CB-00-00-11-3F-9B",
  //   DEVICE_LOCATION: "UNKNOWN"
  // }
  return axios.post(endpoint + "/devicesettings/changedevicename", JSON.stringify(body), reqConfig);
}

export const getSecurityLogs = async () => {
  const body = 
  {
  //  USERID: await getUserId()
  }
  const token = await getCognitoToken();
  const reqConfig = {
    headers: {
      authorization: token,
    }
  };

  return axios.post(endpoint + "/pages/sec", JSON.stringify(body), reqConfig);
}


export const getEnvPage = async () => {
  const body = 
  {
  //  USERID: await getUserId()
  }
const token = await getCognitoToken();
  const reqConfig = {
    headers: {
      authorization: token,
    }
  };
  return axios.post(endpoint + "/pages/envpage", JSON.stringify(body), reqConfig);
}

export const getDashboardPage = async () => {
  const body = 
  {
  //  USERID: await getUserId()
  }
  const token = await getCognitoToken();
  const reqConfig = {
    headers: {
      authorization: token,
    }
  };

  return axios.post(endpoint + "/pages/dashboard", JSON.stringify(body), reqConfig);
}

export const getSpacesPage = async() => {
  const body = 
  {
  //  USERID: await getUserId()
  }
  const token = await getCognitoToken();
    const reqConfig = {
      headers: {
        authorization: token,
      }
  };
  return axios.post(endpoint + "/pages/specs", JSON.stringify(body), reqConfig);
}

export const mapRequest = async (body) => {
  // body.USERID = await getUserId();
  const token = await getCognitoToken();
  const reqConfig = {
    headers: {
      authorization: token,
    }
  };
  //ex.
  // {
  //   "USERID": "KARTHIK",
  //   "ACTION": "GETMAP" or "UPLOADMAP" or "GETSENSORS" or "UPLOADPOINTS"
  // }
  //
  // for "UPLOADPOINTS", add "PARAMS" attribute.
  //
  // ex. 
  //   "PARAMS": [
  //     {
  //         "DEVEUI": "44-91-60-00-00-F7-C7-55",
  //         "mapXCoordinate": 123,
  //         "mapYCoordinate": 345
  //     },
  //     {
  //         "DEVEUI": "58-A0-CB-00-00-10-05-D5",
  //         "mapXCoordinate": 1,
  //         "mapYCoordinate": 2
  //     }
  // ]
  return axios.post(endpoint + "/pages/map", JSON.stringify(body), reqConfig);
}

export const axiosPUT = (preSignedURL, file) => {

  return axios.put(preSignedURL, file);
}


