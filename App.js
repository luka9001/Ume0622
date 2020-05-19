/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component, PureComponent} from 'react';
import {Platform, AppState} from 'react-native';
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
// import {SafeAreaProvider} from 'react-native-safe-area-context';
import userInfo from './pages/util/userInfoUtil';
import AntmModal from '@ant-design/react-native/lib/modal/Modal';
import CountEmitter from './pages/event/CountEmitter';
import TimeUtils from './pages/util/TimeUtil';

// const Navigator = StackNavigator(RouteConfig, StackNavigatorConfig);
const Navigator = createStackNavigator(RouteConfig, StackNavigatorConfig);
const AppContainer = createAppContainer(Navigator);

// const defaultFontFamily = {
//     ...Platform.select({
//         android: {fontFamily: 'Roboto'}
//     })
// };
//
// const oldRender = Text.render;
// Text.render = function (...args) {
//     const origin = oldRender.call(this, ...args);
//     return React.cloneElement(origin, {
//         style: [defaultFontFamily, origin.props.style]
//     });
// };
let JMessageListener = (event) => {
  if (event.type === 'user_kicked') {
    userInfo.logout();
    AntmModal.alert('提醒', '当前未登录,您是否已在其他设备登录过?', [
      {
        text: '确定',
      },
      // {
      //   text: '去登陆',
      //   onPress: () => this.props.navigation.navigate('LoginIndex'),
      // },
    ]);
  }
};

export default class App extends PureComponent {
  constructor(props, context) {
    super(props, context);

    // if (!__DEV__) {
    //   global.console = {
    //     info: () => {},
    //     log: () => {},
    //     warn: () => {},
    //     debug: () => {},
    //     error: () => {},
    //   };
    // }

    this.isAutoLogin = false;
    this.state = {
      hasLogin: false,
      appState: AppState.currentState,
    };
  }

  // 初始化极光IM
  initJIM() {
    JMessage.init({
      appkey: Global.JIMAppKey,
      channel:"",
      isOpenMessageRoaming: false,
      isProduction: true,
    });
    JMessage.addLoginStateChangedListener(JMessageListener);
    // JMessage.addSyncOfflineMessageListener(this.offlineMessageListenser);
    JMessage.setDebugMode({
      enable: false,
    });
    //离线消息监听
    JMessage.addSyncOfflineMessageListener((message) => {
      console.log("| JIGUANG |===addSyncOfflineMessageListener====" + JSON.stringify(message))
    });
  }

  offlineMessageListenser = (result) => {
    // 回调参数 result = {'conversation': {}, 'messageArray': []}，返回离线消息
    console.log(
      'offlinemessage',
      result.conversation + '===' + result.messageArray.length,
    );
  };

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

  // 登录极光IM
  loginToJIM(username, password) {
    this.isAutoLogin = true;
    JMessage.login(
      {
        username: username,
        password: password,
      },
      () => {
        this.loginUsername = username;
        this.loginPassword = password;

        this.getGroupIds();
        // 登录极光IM成功，获取当前用户信息
        this.getCurrentUserInfo();
        let that = this;
        StorageUtil.getWithOutJSONParse('name', (error, name) => {
          if (!Utils.isEmpty(name)) {
            that.jMessageUpdateMyInfo(name);
          }
        });
        //刷新聊天界面
        CountEmitter.emit('notifyLogin');
      },
      (e) => {
        // Toast.info('连接聊天系统失败');
      },
    );
  }

  jMessageUpdateMyInfo(nickname) {
    JMessage.updateMyInfo(
      {nickname: nickname},
      () => {
        // do something.
      },
      (error) => {},
    );
  }

  getCurrentUserInfo() {
    JMessage.getMyInfo((info) => {
      if (info.username === undefined) {
        // 未登录
      } else {
        // 已登录
        UserInfoUtil.userInfo = info;
      }
      // LogUtil.d("current user info: ", info); // 获取未读好友消息数
      DBHelper.getUnreadFriendMsgCount((count) => {
        if (count > 0) {
          // TabConfig.TAB_CONTACT_DOT_COUNT = count;
        }
      });
      // this.fadeOut();
    });
  }

  componentDidMount() {
    JPush.init();
    if (Platform.OS === 'ios') {
      JPush.setBadge({badge: 0, appBadge: 0});
    }
    //连接状态
    this.connectListener = (result) => {
      console.log('connectListener:' + JSON.stringify(result));
    };
    JPush.addConnectEventListener(this.connectListener);
    // //通知回调
    this.notificationListener = (result) => {
      if (Platform.OS === 'ios') {
        JPush.setBadge({badge: 0, appBadge: 0});
      }
      //通知会话列表刷新
      CountEmitter.emit('notifyConversationListRefresh');
      CountEmitter.emit('notifyChattingRefresh');
      CountEmitter.emit('notifyLogin');
      console.log('notificationListener:' + JSON.stringify(result));
    };
    JPush.addNotificationListener(this.notificationListener);
    //本地通知回调
    this.localNotificationListener = (result) => {
      console.log('localNotificationListener:' + JSON.stringify(result));
    };
    JPush.addLocalNotificationListener(this.localNotificationListener);
    //自定义消息回调
    this.customMessageListener = (result) => {
      console.log('customMessageListener:' + JSON.stringify(result));
    };
    JPush.addCustomMessagegListener(this.customMessageListener);
    //tag alias事件回调
    this.tagAliasListener = (result) => {
      console.log('tagAliasListener:' + JSON.stringify(result));
    };
    JPush.addTagAliasListener(this.tagAliasListener);
    //手机号码事件回调
    this.mobileNumberListener = (result) => {
      console.log('mobileNumberListener:' + JSON.stringify(result));
    };
    JPush.addMobileNumberListener(this.mobileNumberListener);

    AppState.addEventListener('change', this._handleAppStateChange);
    if (Platform.OS === 'android') {
      this._androidPermission();
      this.androidPermissionRequest().then((statuses) => console.log(statuses));
    } else if (Platform.OS === 'ios') {
      // this._iosPermission();
      // this.iosPermissionRequest().then(statuses => console.log(statuses));
    }
    // 这里不要用this.state.hasLogin判断
    StorageUtil.get('hasLogin', (error, object) => {
      if (!error && object != null && object.hasLogin) {
        // if (this._isMount) {
        //   this.setState({ hasLogin: object.hasLogin });
        // }
        // 已登录，直接登录聊天服务器
        this.autoLogin();
      } else {
        // 未登录，需要先登录自己的服务器，再登录聊天服务器
        // Animated.timing(this.state.fadeInAnim, {
        //   duration: this.state.fadeInDuration,
        //   toValue: 1
        // }).start(); //开始
      }
    });

    JMessage.addReceiveMessageListener(this.listener); // 添加监听
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

  componentWillMount() {
    this._isMount = true;
    this.initJIM();
  }

  componentWillUnmount() {
    JMessage.removeMessageRetractListener(JMessageListener);
    // AppState.removeEventListener('change', this._handleAppStateChange);
    this._isMount = false;
    this.componentDidHide && this.componentDidHide();
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.initJIM();
      console.log('appstate', 'App has come to the foreground!');
      //通知会话列表刷新
      CountEmitter.emit('notifyConversationListRefresh');
      CountEmitter.emit('notifyChattingRefresh');
      // 这里不要用this.state.hasLogin判断
      StorageUtil.get('hasLogin', (error, object) => {
        if (!error && object != null && object.hasLogin) {
          // if (this._isMount) {
          //   this.setState({ hasLogin: object.hasLogin });
          // }
          // 已登录，直接登录聊天服务器
          this.autoLogin();
        } else {
          // 未登录，需要先登录自己的服务器，再登录聊天服务器
          // Animated.timing(this.state.fadeInAnim, {
          //   duration: this.state.fadeInDuration,
          //   toValue: 1
          // }).start(); //开始
        }
      });
      if (Platform.OS === 'ios') {
        JPush.setBadge({badge: 0, appBadge: 0});
      }
    } else {
      console.log('appstate', 'App has come to the background!');
    }
    this.setState({appState: nextAppState});
  };

  autoLogin() {
    StorageUtil.get('username', (error, object) => {
      if (!error && object && object.username) {
        let username = object.username;
        let password = '';
        // 初始化数据库
        DBHelper.init(username);
        // 获取未读好友消息数
        DBHelper.getUnreadFriendMsgCount((count) => {
          if (count > 0) {
            // TabConfig.TAB_CONTACT_DOT_COUNT = count;
          }
        });
        StorageUtil.get('password', (error, object) => {
          if (!error && object && object.password) {
            password = object.password;
            this.loginToJIM(username, password);
          } else {
            // Toast.showShortCenter("数据异常");
            Toast.info('聊天系统密码异常', 1, undefined, false);
          }
        });
      } else {
        // Toast.showShortCenter("数据异常");
        Toast.info('聊天数据异常', 1, undefined, false);
      }
    });
  }

  getGroupIds() {
    JMessage.getGroupIds(
      (result) => {
        /**
         * result {Array[Number]} 当前用户所加入的群组的groupID的list
         */
        if (result.length > 0) {
        } else {
          jMessage
            .addMembers()
            .then(
              function (params) {},
              function (error) {},
            )
            .done();
        }
      },
      (error) => {},
    );
  }

  render() {
    return (
      // <SafeAreaProvider>
        <AppContainer />
      // </SafeAreaProvider>
    );
  }
}
