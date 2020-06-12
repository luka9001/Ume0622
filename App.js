import React, {Component, PureComponent} from 'react';
import {Platform, AppState, DeviceEventEmitter, View,Text,Button,Animated} from 'react-native';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import RouteConfig from './pages/RouteConfig';
import StackNavigatorConfig from './pages/StackNavigatorConfig';
import JPush from 'jpush-react-native';
import {check, request, PERMISSIONS} from 'react-native-permissions';
import config from './pages/service/config';
import IMDB from './pages/util/IMDB';
import Global from './pages/util/Global';
import LogUtil from './pages/util/LogUtil';
import StorageUtil from './pages/util/StorageUtil';
import { Provider } from 'react-redux';
import { connect } from 'react-redux';
import { change,setMsgUnreadCount } from './pages/actions/actionCreators';
import store from './pages/store/index';
import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Navigator = createStackNavigator(RouteConfig, StackNavigatorConfig);
const AppContainer = createAppContainer(Navigator);
// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();

class App extends PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            hasLogin: false,
            appState: AppState.currentState,
            ws: null,
            client_list: {},
            count: 100
        };

        this.WebSocketConnect = this.WebSocketConnect.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    //给其他用户发送信息
    // ws.send('{"type":"singleTalk","to_client_id":"'+to_client_id+'","to_client_name":"'+to_client_name+'","content":"'+input.value.replace(/"/g, '\\"').replace(/\n/g,'\\n').replace(/\r/g, '\\r')+'"}');
    WebSocketConnect(client_name, client_nickname) {
        let ws = new WebSocket(
            config.imHost,
        );

        this.setState({
            ws: ws,
        });

        ws.onopen = e => this.onopen(ws, client_name, client_nickname);

        ws.onmessage = e => this.onmessage(e, ws);
        ws.onclose = e => {
            console.log('onclose', e);
            ws.close();
            //切换后台主动关闭，无需重连
            if (this.state.appState !== 'background') {
                setTimeout(() => {
                    this.WebSocketConnect(client_name, client_nickname);
                }, 10000);
            }
        };
        ws.onerror = e => {
            console.log('onerror', e);
            ws.close();
            // setTimeout(() => {
            //     this.WebSocketConnect(client_name, client_nickname);
            // }, 10000);
        };

        // ws = null;
    }

    // 连接建立时发送登录信息
    onopen(ws, client_name, client_nickname) {
        // 登录
        let login_data = '{"type":"login","client_name":"' + client_name + '","client_nickname" : "' + client_nickname + '","room_id":"1"}';
        console.log('websocket握手成功，发送登录数据:' + login_data);
        ws.send(login_data);
    }

    // 服务端发来消息时
    onmessage(e, ws) {
        console.log(e.data);
        let data = JSON.parse(e.data);
        switch (data['type']) {
            // 服务端ping客户端
            case 'ping':
                ws.send('{"type":"pong"}');
                break;
            // 登录 更新用户列表
            case 'login':
                // LogUtil.d('登录数据', data);

                //{"type":"login","client_id":xxx,"client_name":"xxx","client_list":"[...]","time":"xxx"}
                // say(data['client_id'], data['client_name'],  data['client_name']+' 加入了聊天室', data['time']);
                // console.log(data);
                // if(data['client_list'])
                // {
                //   this.state.client_list = data['client_list'];
                // }
                // else
                // {
                //   this.state.client_list[data['client_id']] = data['client_name'];
                // }
                //刷新用户列表
                // flush_client_list();
                Global.client_id = data['client_id'];
                Global.client_name = data['client_name'];
                Global.client_nickname = data['client_nickname'];
                //     "client_list":{
                //     "7f00000108ff0000000d":"1",
                //         "7f00000108fe0000000f":"89"
                // }
                // Global.client_list = data['client_list'];

                /**
                 * 处理其他人的登录信息
                 */
                // {
                //     "type":"login",
                //     "client_id":"7f00000108fe00000010",
                //     "client_name":"1",
                //     "client_nickname":"test",
                //     "time":"2020-06-05 13:39:53"
                // }
                break;
            case 'unread': {
                LogUtil.d('未读数据', data);
                IMDB.insertUnreadMsg(data['data'], (result) => {
                    DeviceEventEmitter.emit('unread', {type: 'unread'});
                    this.queryMsgUnreadCount();
                });
                break;
            }
            // 发言
            case 'say':
                //{"type":"say","from_client_id":xxx,"to_client_id":"all/client_id","content":"xxx","time":"xxx"}
                // say(data['from_client_id'], data['from_client_name'], data['content'], data['time']);
                //   console.log(data);

                // DeviceEventEmitter.emit('onmessage', data);
                break;
            case 'singleTalk': {
                IMDB.insertHistoryMsg(data,(result)=>{
                    this.queryMsgUnreadCount()
                });
                DeviceEventEmitter.emit('onmessage', data);
                break;
            }
            case 'getDisturbResult': {
                LogUtil.d('getDisturb data:', data);
                DeviceEventEmitter.emit('getDisturbResult', data);
                break;
            }
            case 'setDisturbResult': {
                LogUtil.d('setDisturb data:', data);
                if (data['result']) {
                    if (data['action'] === 'add') {
                        IMDB.insertDisturb(data, (result) => {
                            DeviceEventEmitter.emit('setDisturbResult', data);
                        });
                    } else if (data['action'] === 'del') {
                        IMDB.delDisturb(data, (result) => {
                            DeviceEventEmitter.emit('setDisturbResult', data);
                        });
                    }
                } else {
                    DeviceEventEmitter.emit('setDisturbResult', data);
                }
                break;
            }
            // 用户退出 更新用户列表
            case 'logout':
                //{"type":"logout","client_id":xxx,"time":"xxx"}
                // say(data['from_client_id'], data['from_client_name'], data['from_client_name']+' 退出了', data['time']);
                console.log(data);
            //退出
            // delete client_list[data['from_client_id']];
            // flush_client_list();
        }
    }

    _iosPermission() {
        Promise.all([
            check(PERMISSIONS.IOS.CAMERA),
            check(PERMISSIONS.IOS.PHOTO_LIBRARY),
            check(PERMISSIONS.IOS.MICROPHONE),
        ]).then(([cameraStatus, contactsStatus]) => {
            console.log({cameraStatus, contactsStatus});
        });
    }

    _androidPermission() {
        Promise.all([
            check(PERMISSIONS.ANDROID.CAMERA),
            check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE),
            check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE),
        ]).then(([cameraStatus, contactsStatus]) => {
            console.log({cameraStatus, contactsStatus});
        });
    }

    async androidPermissionRequest() {
        const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);
        const readExternalStorageStatus = await request(
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        );
        const writeExternalStorageStatus = await request(
            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        );
        return {
            cameraStatus,
            readExternalStorageStatus,
            writeExternalStorageStatus,
        };
    }

    async iosPermissionRequest() {
        const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
        const photoLibraryStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        const microPhoneStatus = await request(PERMISSIONS.IOS.MICROPHONE);
        return {cameraStatus, photoLibraryStatus, microPhoneStatus};
    }

    initJpush() {
        JPush.setLoggerEnable(Global.DEBUG);
        JPush.init();

        //连接状态
        this.connectListener = result => {
            console.log('connectListener:' + JSON.stringify(result));
        };
        JPush.addConnectEventListener(this.connectListener);
        //通知回调
        this.notificationListener = result => {
            console.log('notificationListener:' + JSON.stringify(result));
        };
        JPush.addNotificationListener(this.notificationListener);
        //本地通知回调
        this.localNotificationListener = result => {
            console.log('localNotificationListener:' + JSON.stringify(result));
        };
        JPush.addLocalNotificationListener(this.localNotificationListener);
        //自定义消息回调
        this.customMessageListener = result => {
            console.log('customMessageListener:' + JSON.stringify(result));
        };
        JPush.addCustomMessagegListener(this.customMessageListener);
        //tag alias事件回调
        this.tagAliasListener = result => {
            console.log('tagAliasListener:' + JSON.stringify(result));
        };
        JPush.addTagAliasListener(this.tagAliasListener);
        //手机号码事件回调
        this.mobileNumberListener = result => {
            console.log('mobileNumberListener:' + JSON.stringify(result));
        };
        JPush.addMobileNumberListener(this.mobileNumberListener);
    }

    initPermission() {
        if (Platform.OS === 'android') {
            this._androidPermission();
            this.androidPermissionRequest().then((statuses) => console.log(statuses));
        } else if (Platform.OS === 'ios') {
            // this._iosPermission();
            // this.iosPermissionRequest().then(statuses => console.log(statuses));
        }
    }

    addListener() {
        // 添加APP运行状态监听
        AppState.addEventListener('change', this.handleAppStateChange);

        this.appLogin = DeviceEventEmitter.addListener('appLogin', (data) => {
            LogUtil.d('登录信号数据:', data);
            let alias = Global.jPushHeader + data['user_info']['id'];
            JPush.setAlias({sequence: 1, alias: alias});
            // 首次进入建立连接
            this.startWebSocketConnect();
        });

        this.sendMessage = DeviceEventEmitter.addListener('sendMessage', (data) => {
            let _data = JSON.parse(data);
            _data['tag'] = 0;
            LogUtil.d('发送消息:', _data);
            /**
             * 将发送的msg from_client和to_client翻转方便显示时查询,用type=singleTalkByMe标记
             */
            _data['type'] = 'singleTalkByMe';
            const pre_from_client_name = _data['from_client_name'];
            const pre_from_client_id = _data['from_client_id'];
            const pre_to_client_name = _data['to_client_name'];
            const pre_to_client_id = _data['to_client_id'];
            _data['from_client_name'] = pre_to_client_name;
            _data['from_client_id'] = pre_to_client_id;
            _data['to_client_name'] = pre_from_client_name;
            _data['to_client_id'] = pre_from_client_id;
            IMDB.insertHistoryMsg(_data, (result) => {
                DeviceEventEmitter.emit('onmessage', _data);
            });
            this.state.ws.send(data);
        });

        this.logout = DeviceEventEmitter.addListener('logout', () => {
            //数据库清除
            IMDB.reset();
            //jpush退出
            JPush.deleteAlias({sequence: 1});
            StorageUtil.set('hasLogin', {hasLogin: false});
            this.closeChat();
        });

        this.getDisturb = DeviceEventEmitter.addListener('getDisturb', (data) => {
            this.state.ws.send(data);
        });

        this.setDisturb = DeviceEventEmitter.addListener('setDisturb', (data) => {
            this.state.ws.send(data);
            LogUtil.d('发送设置免打扰命令', data);
        });

    }

    closeChat(){
        if(this.state.ws !== null)
        {
            this.state.ws.close();
        }
    }

    startWebSocketConnect() {
        IMDB.queryUserInfo((result) => {
            let data = result[0];
            let client_name = data['ID'];
            let client_nickname = data['NAME'];
            LogUtil.d('用户数据：', result);
            this.WebSocketConnect(client_name, client_nickname);
        });
    }

    componentDidMount() {
        StorageUtil.get('hasLogin', (error, object) => {
            if (!error && object != null && object.hasLogin) {
                //初始化数据库
                StorageUtil.get('uid', (error, object) => {
                    if (!error && object && object.uid) {
                        let uid = object.uid;
                        // 初始化数据库
                        IMDB.hasLoginInit(uid);
                        this.queryMsgUnreadCount();
                        this.startWebSocketConnect();
                    }
                });
            }
        });
        this.addListener();
        this.initJpush();
        this.initPermission();
    }

    queryMsgUnreadCount(){
        IMDB.queryMsgUnreadCount((result)=>{
            store.dispatch(setMsgUnreadCount(result['count']))
        });
    }

    removeListener() {
        this.appLogin.remove();
        this.logout.remove();
        this.sendMessage.remove();
        this.getDisturb.remove();
        this.setDisturb.remove();
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
        this.removeListener();
    }

    handleAppStateChange = (nextAppState) => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            console.log('前台');
            if (Platform.OS === 'ios') {
                JPush.setBadge({badge: 0, appBadge: 0});
            }

            // 建立前先关闭之前的废弃连接
            // this.state.ws.close();
            StorageUtil.get('hasLogin', (error, object) => {
                if (!error && object != null && object.hasLogin) {
                    this.startWebSocketConnect();
                }
            });
        } else if (nextAppState === 'background') {
            console.log('后台');
            // const logoutData = '{"type":"logout","client_id":xxx,"time":"xxx"}';
            StorageUtil.get('hasLogin', (error, object) => {
                if (!error && object != null && object.hasLogin) {
                    console.log('关闭');
                    this.state.ws.close();
                }
            });
        }
        this.setState({appState: nextAppState});
    };

    render() {
        return (
            <Provider store={store}>
            <AppContainer/>
            </Provider>
        );
    }
}

const mapState = state => ({
    data: state.data
});

const mapDispatch = dispatch => ({
    changeData() {
        dispatch(change())
    }
});

export default App
