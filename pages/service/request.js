// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import {Platform} from "react-native";
import {Toast} from "@ant-design/react-native";

const url = config.host;
const headers = config.header;

const api = {
    get: function (local, params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/' + local, {
                method: 'GET',
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
                    } else {
                        reject('error');
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    post: function (local, params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/' + local, {
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
                    } else {
                        reject(responseData);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    postWithLoginCheck: function (local, params, nav) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/' + local, {
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
                    } else {
                        reject(responseData);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    postWithPhotos: function (local, params, photos) {
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
            fetch(url + '/api/' + local, {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                },
                body: formData,
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.code === 200) {
                        resolve(responseData);
                    } else {
                        reject('error');
                    }
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }
};

export default api;