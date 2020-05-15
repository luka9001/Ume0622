// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import { Platform } from "react-native";
import userInfoUtil from "../util/userInfoUtil";
import tokenApi from './api';
import StorageUtil from "../util/StorageUtil";
import { AsyncStorage } from "react-native";

const url = config.host;
const headers = config.header;

const api = {
  postReport: function (params) {
    return new Promise(function (resolve, reject) {
      let local = '/api/v1/report';
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
            resolve(responseData.data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

export default api;