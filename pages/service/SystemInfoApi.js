// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import {Platform} from "react-native";
import userInfoUtil from "../util/userInfoUtil";

const url = config.host;
const headers = config.header;

const api = {
    getSysInfo: function () {
        return new Promise(function (resolve, reject) {
            let local = '/api/v1/getversion';
            if (config.access_token !== 'none') {
                local = '/api/v1/getsi';
            }

            fetch(url + local, {
                method: 'GET',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.code === 200) {
                        resolve(responseData);
                    } else {
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