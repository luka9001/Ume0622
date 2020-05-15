// import { resolve } from "uri-js";
// import { reject } from "when";

import config from "./config";
import {Platform} from "react-native";
import {c_fetch} from '../util/Fetch';
const url = config.host;
const headers = config.header;
// const header_multipart = config.header_multipart;
// const access_token = config.access_token;
// const access_token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImFmOTc4OGU0ZGVlMmI0ZDk0ZDBiMmJmMjcyYjE4YjgzOGE3MjkyMTQ1MWQ4YzJjODUzY2RlNjExMzA2NDdlNmY1Mjg2MTRlZmU1ZjQzYWRmIn0.eyJhdWQiOiIxIiwianRpIjoiYWY5Nzg4ZTRkZWUyYjRkOTRkMGIyYmYyNzJiMThiODM4YTcyOTIxNDUxZDhjMmM4NTNjZGU2MTEzMDY0N2U2ZjUyODYxNGVmZTVmNDNhZGYiLCJpYXQiOjE1NjUxNTc4OTEsIm5iZiI6MTU2NTE1Nzg5MSwiZXhwIjoxNTk2NzgwMjkxLCJzdWIiOiI0NSIsInNjb3BlcyI6WyIqIl19.FFEOFPtCsX0BzoDT6m50V8hte82dQNnaU_NqiYpnoN4jdX0XFiNRHZJXbJVC3lYVi6k-V3EJSxUcf8Ts-khqX8y7twp-Mp-c8PyxtTGOqUBmA5aHgfg3lw3PaRa_Hwf7FavNDyK16tacIUCin5JWMpp2pv4mszvXbTtNJXLH_BX4WjpMjh8ubcwOpRFU6TdP1IsjgYbk1Xi_aMrieoBv9rTYrOGp14r8Ri42ACR2oVYE0XQyKhcgGNbhlinL4wNRjyJ0l48vxkMwx51C_cGKCSq9D1G-Mv0jSOFPBkPJlgUZYlV3c6GAzjh1h9AiZHFQ0roCKFd1QhBSyV2m_mTZfOVFdMqLKsXhbRvRf8X3EVeAsDt1UrIvupwYVsYLpcitfjhpBftlhz0AzR2kl-yu9p-jRPPJbRKChzvrBejOQfalkfwvS5ZVc-cm5x7peoakZfVdX8N8ywJmxJFaGU9UAoTOf6lXmW9mD011xMZfDeosYDs95FChNYCojAV_xzmKmhdmcpTJbxFPsKMt8zb2swW86VTEUFDr-EvBozP_GDZDbdyc4WnXcxsMxD_3GGd28-P8yVv_Zz9NvF82H6EXI8PRkEwMwdHTc5uaY8EdBUim7h24dhpUhKpvai8qTkAkxyKv0OpLCkV0Vv0CupWz5zs5UmBFw4X0srZM4hm_rsM';
// const refresh_token = config.refresh_token;
// const refresh_token = 'Bearer def502000559c17491986469ecb68b2f46d19a8e2f52fa77b3046e4719e663d6e95e49dce68c7077e0bebe6d2d547efcbae3e6adf429aa4b96eedf30126d114485ca1164694475b7d6d0625499c663958a32bf5772b6def3a42a37806c84f98fea61477e7bb5fdce0f54c7ef35a486aad0a7aeb2ece23b39ac77bbe1b451e20e68174ffae5023ac37c7f8402b310c13c2b846c8a020e639c29118a77c4c131c9f4b16c0d6fcd4734ad1b37c67dc7be710976120ed84123a6f41403ef717ce4c1930c2ff6a3c508dfb6b02ef3a374cd77ab4c4a47f09f072a6c66773c00436ceadabe6b6fddd823bededad9a30021e90d0e392e7c88c936c771240eb2844157bff50361be52e46091bac6de8a2b8240fd357319b53544e356105f18a98413fff12acc85167aa2b85b57c9bf68102c0c47b1c102cbc923dfa5947d15f2fd0d7eb3496c07cade12c1299217c8d7ca69fdc6f9e4233e1f6ea7b3bbc6de7681041894438a68348c';

const api = {
    getGroupAvatarByGID: function (params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/ga', {
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
                    console.log(err);
                    reject(err);
                });
        });
    },
    getUserNickNameByUID: function (params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/gun', {
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
                    console.log(err);
                    reject(err);
                });
        });
    },
    postMessage: function (params, photos) {
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
            fetch(url + '/api/v1/sendmessage', {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                },
                body: formData,
            }).then((response) => response.json())
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    },
    postLike: function (params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/postlikes', {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: params,
            }).then((response) => response.json())
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    },
    postComment: function (params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/postcomment', {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: params,
            }).then((response) => response.json())
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    },
    getComments: function (page, params) {
        return new Promise(function (resolve, reject) {
            let local = '/api/v1/getcomments?page=' + page;
            if (config.access_token !== 'none') {
                local = '/api/v1/getcommentslogin?page=' + page;
            }
            fetch(url + local, {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: params,
            }).then((response) => response.json())
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    },
    getCommentsByUser: function (page) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/getcommentsbyuser?page=' + page, {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json())
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    },
    getThumbUpByUser: function (page) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/getthumbupbyuser?page=' + page, {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json())
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    },
    getCommentsCount: function (page) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/getcommentscount?page=' + page, {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json())
                .then((responseData) => {
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    },
    getSocialList: function (page) {
        return new Promise(function (resolve, reject) {
            let local = '/api/v1/getsocial?page=' + page;
            if (config.access_token !== 'none') {
                local = '/api/v1/getsociallogin?page=' + page;
            }
            c_fetch(url + local, {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
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
    },
    getMySocialList: function (page, params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/getmysocial?page=' + page, {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: params
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.code === 200) {
                        resolve(responseData.data);
                    } else {
                        reject('err');
                    }
                })
                .catch((err) => {
                    console.log('err', err);
                    reject(err);
                });
        });
    },
    delMySocial: function (params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/delsocial', {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: params
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.code === 200) {
                        resolve(responseData.data);
                    } else {
                        reject('err');
                    }
                })
                .catch((err) => {
                    console.log('err', err);
                    reject(err);
                });
        });
    },
    delMyComment: function (params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/delmycomment', {
                method: 'POST',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: params
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.code === 200) {
                        resolve(responseData.data);
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
