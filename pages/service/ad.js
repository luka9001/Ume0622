// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import { Platform } from "react-native";
import userInfoUtil from "../util/userInfoUtil";

const url = config.host;
const headers = config.header;

const api = {
  postSignUp: function (params) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/adsu', {
        method: 'post',
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
          else if (responseData.code === 202) {
            resolve(responseData);
          }
          else {
            reject('err');
          }
        })
        .catch((err) => {
          console.log('err', err);
          reject(err);
        });
    });
  }
};

export default api;