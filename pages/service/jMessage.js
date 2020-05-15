// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import { Platform } from "react-native";
import userInfoUtil from "../util/userInfoUtil";
import Base64Utils from "../util/Base64";
import Global from "../util/Global";

const url = config.host;
const headers = config.header;

const api = {
  /**
   * 加西班牙群
   * @returns {Promise<R>}
   */
  addMembers: function () {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/agm', {
        method: 'post',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json())
        .then((responseData) => {
          if (responseData.code === 200) {
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
  },
  getMembersInfo: function (params) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/gmi', {
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