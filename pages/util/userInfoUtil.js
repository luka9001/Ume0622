import {AsyncStorage} from "react-native";
import config from "../service/config";
import Utils from '../util/Utils';
import DBHelper from "./DBHelper";
import StorageUtil from "./StorageUtil";
import {Toast} from "@ant-design/react-native";
import cache from "./cache";
import CountEmitter from "../event/CountEmitter";

const userInfo = {
    saveUserInfo: async (params) => {
        config.name = params.name;
        config.lifephotos = JSON.parse(params.lifephoto)[0];
        config.state = params.state;
        await AsyncStorage.setItem('name', params.name);
        await AsyncStorage.setItem('lifephotos', params.lifephoto);
        await AsyncStorage.setItem('state', params.state);
    },
    getUserInfoState: function () {
        return AsyncStorage.getItem('state');
    },
    initUserInfo: async function () {
        try {
            const value = await AsyncStorage.getItem('access_token');
            const state = await AsyncStorage.getItem('state');
            const name = await AsyncStorage.getItem('name');
            config.name = name;
            config.state = state;
            config.access_token = value === null ? 'none' : value;
            if (config.state === '1') {
                const lifephotos = await AsyncStorage.getItem('lifephotos');
                config.lifephotos = JSON.parse(lifephotos)[0];

                const sex = await AsyncStorage.getItem('sex');
                config.sex = sex;
            }
        } catch (error) {
            // Error saving data
            console.log(error);
        }
    },
    logout: function () {
        config.access_token = 'none';
        config.refresh_token = 'none';
        config.lifephotos = '';
        config.name = '';
        config.state = '';
        config.sex = '';
        cache.language = [];
        cache.nlanguage = [];
        AsyncStorage.setItem('access_token', 'none');
        AsyncStorage.setItem('refresh_token', 'none');
        AsyncStorage.setItem('name', '');
        AsyncStorage.setItem('lifephotos', '');
        AsyncStorage.setItem('state', '');
        AsyncStorage.setItem('sex', '');
        StorageUtil.set("vip_level", 0);
        // DBHelper.reset();
        StorageUtil.set("hasLogin", {hasLogin: false}, () => {
            CountEmitter.emit("notifyLogin");
        });
    }
};

export default userInfo
