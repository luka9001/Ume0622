// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import { Platform } from "react-native";
import userInfoUtil from "../util/userInfoUtil";

const url = config.host;
const headers = config.header;

const api = {
  getSMSCode: function (params) {
    return new Promise(function (resolve, reject) {
      let local = '/api/sc';
      fetch(url + local, {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: params
      }).then((response) => response.json())
        .then((responseData) => {
          if (responseData.code === 200) {
            resolve(responseData);
          }
          else {
            reject(responseData);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  resetPassword: function (params) {
    return new Promise(function (resolve, reject) {
      let local = '/api/rp';
      fetch(url + local, {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: params
      }).then((response) => response.json())
        .then((responseData) => {
          resolve(responseData);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

export default api;