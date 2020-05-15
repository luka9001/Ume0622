import config from "./config";

const url = config.host;

const MatchMakerApi = {
    getMatchMakerPage: function (page) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/mkp?page=' + page, {
                method: 'GET',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.code === 200) {
                        resolve(responseData);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getMatchMakerLogPage: function (page, mid) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/mklp?page=' + page + '&mid=' + mid, {
                method: 'GET',
                headers: {
                    "Authorization": config.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.code === 200) {
                        resolve(responseData);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    postMatchMakerLog: function (params) {
        return new Promise(function (resolve, reject) {
            fetch(url + '/api/v1/mkl', {
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

export default MatchMakerApi;
