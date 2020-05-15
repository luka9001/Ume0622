import StorageUtil from "../util/StorageUtil";
import config from "./config";

const url = config.host;
const userInfoApi = {
    getUserInfo: function () {
        StorageUtil.get("check_status", (error, object) => {
            //审核中状态，检查服务器
            if (object !== 1) {
                // console.log('123');
                // console.log(object);
                // return new Promise(function (resolve, reject) {
                fetch(url + '/api/v1/getuserinfo', {
                    method: 'POST',
                    headers: {
                        "Authorization": config.access_token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }).then((response) => response.json())
                    .then((responseData) => {
                        // console.log(responseData.check_status);
                        StorageUtil.set('check_status', responseData.data.check_status);
                        // resolve(responseData);
                    })
                    .catch((err) => {
                        // reject(err);
                    });
                // });
            }
        })
    }
};

export default userInfoApi;
