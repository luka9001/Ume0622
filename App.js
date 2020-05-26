import React, {Component, PureComponent} from 'react';
import {Platform, AppState, DeviceEventEmitter} from 'react-native';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import RouteConfig from './pages/RouteConfig';
import StackNavigatorConfig from './pages/StackNavigatorConfig';

import {Toast} from '@ant-design/react-native';
import UserInfoUtil from './pages/util/MessageUserInfoUtil';
import DBHelper from './pages/util/DBHelper';
import StorageUtil from './pages/util/StorageUtil';
import Global from './pages/util/Global';
import Utils from './pages/util/Utils';

import JMessage from 'jmessage-react-plugin';
import JPush from 'jpush-react-native';
import jMessage from './pages/service/jMessage';

import {check, request, PERMISSIONS} from 'react-native-permissions';
import userInfo from './pages/util/userInfoUtil';
import AntmModal from '@ant-design/react-native/lib/modal/Modal';
import CountEmitter from './pages/event/CountEmitter';

const Navigator = createStackNavigator(RouteConfig, StackNavigatorConfig);
const AppContainer = createAppContainer(Navigator);

export default class App extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.isAutoLogin = false;
    this.state = {
      hasLogin: false,
      appState: AppState.currentState,
      ws:{},
      client_list:{}
    };

    this.WebSocketConnect = this.WebSocketConnect.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  WebSocketConnect() {
    let ws = null;
    ws = new WebSocket(
        "ws://192.168.210.145:7272"
    );

    this.setState({
      ws: ws
    });

    ws.onopen = e => this.onopen();
    // ws.onmessage = evt => {
    //   console.log("onmessage", JSON.parse(evt.data));
    //   this.setState({
    //     Info: JSON.parse(evt.data)
    //   });
    //   DeviceEventEmitter.emit("sceneChange", {
    //     // 参数
    //   });
    // };
    ws.onmessage = e => this.onmessage(e);
    ws.onclose = e => {
      console.log("onclose", e);
    };
    ws.onerror = e => {
      console.log("onerror", e);
    };

    ws = null
  }

  // 连接建立时发送登录信息
  onopen()
  {
    // 登录
    let login_data = '{"type":"login","client_name":"'+"luke"+'","room_id":"1"}';
    console.log("websocket握手成功，发送登录数据:"+login_data);
    this.state.ws.send(login_data);
  }

  // 服务端发来消息时
  onmessage(e)
  {
    console.log(e.data);
    let data = JSON.parse(e.data);
    switch(data['type']){
        // 服务端ping客户端
      case 'ping':
        this.state.ws.send('{"type":"pong"}');
        break;
        // 登录 更新用户列表
      case 'login':
        //{"type":"login","client_id":xxx,"client_name":"xxx","client_list":"[...]","time":"xxx"}
        // say(data['client_id'], data['client_name'],  data['client_name']+' 加入了聊天室', data['time']);
        console.log(data);
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
        console.log(data['client_name']+"登录成功");
        break;
        // 发言
      case 'say':
        //{"type":"say","from_client_id":xxx,"to_client_id":"all/client_id","content":"xxx","time":"xxx"}
        // say(data['from_client_id'], data['from_client_name'], data['content'], data['time']);
        //   console.log(data);
        DeviceEventEmitter.emit('onmessage', data);
        break;

      case 'singleTalk':
        DeviceEventEmitter.emit('onmessage', data);
        break;
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

  componentDidMount() {
    // 首次进入建立连接
    this.WebSocketConnect();
    // 添加监听前，先移除之前的监听
    AppState.removeEventListener('change', this.handleAppStateChange);
    // 添加APP运行状态监听
    AppState.addEventListener('change', this.handleAppStateChange);

    if (Platform.OS === 'android') {
      this._androidPermission();
      this.androidPermissionRequest().then((statuses) => console.log(statuses));
    } else if (Platform.OS === 'ios') {
      // this._iosPermission();
      // this.iosPermissionRequest().then(statuses => console.log(statuses));
    }
  }

  listener = (message) => {
    if (!Utils.isEmpty(message)) {
      // console.log(message);
      JMessage.getAllUnreadCount((result) => {
        console.log(result);
      });
      // 进入聊天界面后，通知会话列表刷新
      CountEmitter.emit('notifyConversationListRefresh');
    }
  };


  componentWillUnmount() {
    // 组件销毁前，移除监听
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  //状态改变响应
  handleAppStateChange(appState) {
    // console.log('当前状态为:'+appState);
    // 只有ios系统才需要做状态处理
    if(Platform.OS === "ios"&&appState==="active"){
      // 建立前先关闭之前的废弃连接
      this.state.ws.close();
      this.WebSocketConnect();
      // ios 唤醒时补充请求一下数据
      DeviceEventEmitter.emit("sceneChange", {
        // 参数
      });
    }
  }
  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('appstate', 'App has come to the foreground!');
      //通知会话列表刷新
      CountEmitter.emit('notifyConversationListRefresh');
      CountEmitter.emit('notifyChattingRefresh');
      // 这里不要用this.state.hasLogin判断
      StorageUtil.get('hasLogin', (error, object) => {
        if (object != null && object.hasLogin) {

        } else {

        }
      });

    } else {
      console.log('appstate', 'App has come to the background!');
    }
    this.setState({appState: nextAppState});
  };

  render() {
    return (
      // <SafeAreaProvider>
        <AppContainer />
      // </SafeAreaProvider>
    );
  }
}
