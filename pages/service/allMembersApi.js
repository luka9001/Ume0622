import config from "./config";
import tokenApi from './api';
import { AsyncStorage } from "react-native";

const url = config.host;
const headers = config.header;

const api = {
  getMembersList: function (page, filter) {
    return new Promise(function (resolve, reject) {
      let local = '/api/v1/getmembers?page=' + page + '&filter=' + filter;
      if (config.access_token !== 'none') {
        local = '/api/v1/getmemberslogin?page=' + page + '&filter=' + filter;
      }
      fetch(url + local, {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter
        })
      }).then((response) => response.json())
        .then((responseData) => {
          if (responseData.code === 200) {
            resolve(responseData);
          }
          else if (responseData.error === 'Unauthenticated.') {
            AsyncStorage.getItem("refresh_token", (error, object) => {
              if (!error && object != null) {
                config.refresh_token = object;
                tokenApi.refreshToken();
              }
            })

            // StorageUtil.get("refresh_token", (error, refresh_token) => {
            //   if (!error && refresh_token != null) {
            //     config.refresh_token = refresh_token;
            //     tokenApi.refreshToken();
            //   }
            // });
          }
          else {
            reject('err');
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getMemberData: function (id) {
    return new Promise(function (resolve, reject) {
      let local = '/api/v1/getmemberdetail';
      if (config.access_token !== 'none') {
        local = '/api/v1/getmemberdetaillogin'
      }
      fetch(url + local, {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id
        })
      }).then((response) => response.json())
        .then((responseData) => {
          if (responseData.code === 200) {
            resolve(responseData.data);
          }
          else if (responseData.error === 'Unauthenticated.') {
            console.log('aslkdfljaslkdjfjsalkfjaslkjflajsd');
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
  postFavorite: function (id) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/savefavorites', {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favorite_uid: id
        })
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
  postDelFavorite: function (id) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/delfavorites', {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favorite_uid: id
        })
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
  postLike: function (id) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/delfavorites', {
        method: 'POST',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favorite_uid: id
        })
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
  getMyFavorites: function (page) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/getmyfavorites?page=' + page, {
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
  getFavoriteMe: function (page) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/getfavoriteme?page=' + page, {
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
  postMatchMaker: function (body) {
    return new Promise(
      function (resolve, reject) {
        fetch(url + '/api/v1/cmk', {
          method: 'POST',
          headers: {
            "Authorization": config.access_token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: body
        }).then((response) => response.json()).then((responseData) => {
          if (responseData.code === 200) {
            resolve(responseData);
          }
          else {
            reject('err');
          }
        }).catch((err) => {
          console.log('err', err);
          reject(err);
        });
      }
    );
  },
  postBlackList: function (params) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/pbl', {
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
            reject('err');
          }
        })
        .catch((err) => {
          console.log('err', err);
          reject(err);
        });
    });
  },
  delBlackList: function (params) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/dbl', {
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
            reject('err');
          }
        })
        .catch((err) => {
          console.log('err', err);
          reject(err);
        });
    });
  },
  getBlackList: function (page) {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/gbl?page=' + page, {
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
  getCoin: function () {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/coin', {
        method: 'post',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json())
        .then((responseData) => {
          if (responseData.code === 200) {
            resolve(responseData.data);
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
  getMatchMakerPriceInfo: function () {
    return new Promise(function (resolve, reject) {
      fetch(url + '/api/v1/mkpi', {
        method: 'post',
        headers: {
          "Authorization": config.access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json())
        .then((responseData) => {
          if (responseData.code === 200) {
            resolve(responseData.data);
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
