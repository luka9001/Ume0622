// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import {Platform} from "react-native";
import _fetch from './FetchUtils';

const url = config.host;
const headers = config.header;
// const header_multipart = config.header_multipart;

const api = {
    postPI: function (params, photos) {
      let formData = new FormData();
      for (let key in params) {
        formData.append(key, params[key]);
      }
      photos.map((photo, index) => {
        let source = {uri: photo.uri};
        if (photo.enableBase64) {
          source = {uri: photo.base64};
          console.log('base64!!!!!!!!!!!!!!!!!!!!');
        }
        formData.append(`file${index}`, {
          uri: Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", ""),
          type: "multipart/form-data", // or photo.type
          name: `${index}`
        });
      });

      const myFetch =  fetch(url + '/api/v1/pi', {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
        },
        body: formData,
      });
      return new Promise((resolve, reject) => {
          _fetch.FetchTimeout(myFetch, 80000)
            .then(response => {
              return response.json();
            })
            .then(responseData=>{
              resolve(responseData)
            })
            .catch(error=>{
              console.log('网络错误');
              reject(error);
            });
      });
    },
    postPersonalInformation: function (params, photos) {
        return new Promise(function (resolve, reject) {
            let formData = new FormData();
            for (let key in params) {
                formData.append(key, params[key]);
            }
            photos.map((photo, index) => {
                let source = {uri: photo.uri};
                if (photo.enableBase64) {
                    source = {uri: photo.base64};
                    console.log('base64!!!!!!!!!!!!!!!!!!!!');
                }
                formData.append(`file${index}`, {
                    uri: Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", ""),
                    type: "multipart/form-data", // or photo.type
                    name: `${index}`
                });
            });

            fetch(url + '/api/v1/pi', {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                },
                body: formData,
            }).then((response) => {
                return response.json();
            })
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log('err什么情况', err);
                    reject(err);
                });
        });
    },
    getUserInfo: function () {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/getuserinfo', {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                },
            }).then((response) => {
                return response.json();
            })
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
