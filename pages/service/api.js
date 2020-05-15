// import service from "./service";
import config from './config';
import StorageUtil from "../util/StorageUtil";

const api = {
  postList: function (params) {
    // return service.post("/code", params);
  },
  //Unauthenticated
  refreshToken: function () {
    return new Promise(function (resolve, reject) {
      fetch(config.host + '/api/refreshtoken', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: config.refresh_token
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
  }
};

export default api;