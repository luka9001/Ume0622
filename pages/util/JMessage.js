import LogUtil from "./pages/util/LogUtil";
import UserInfoUtil from "./pages/util/MessageUserInfoUtil";
import DBHelper from "./pages/util/DBHelper";
import StorageUtil from "./pages/util/StorageUtil";
import Global from "./pages/util/Global";

import JMessage from "jmessage-react-plugin";
import {Toast} from "@ant-design/react-native";


function register(username, password) {
  let confirmPwd = password;
  // if (
  //   Utils.isEmpty(username) ||
  //   Utils.isEmpty(password) ||
  //   Utils.isEmpty(confirmPwd)
  // ) {
  //   Toast.showShortCenter("用户名或密码不能为空！");
  //   return;
  // }
  // if (this.isContainChinese(username)) {
  //   Toast.showShortCenter("用户名不能包含中文！");
  //   return;
  // }
  // if (username.length > 15 || username.length < 4) {
  //   Toast.showShortCenter("用户名长度为[4, 15]！");
  //   return;
  // }
  // if (password.length < 6) {
  //   Toast.showShortCenter("密码至少需要6个字符！");
  //   return;
  // }
  // if (password !== confirmPwd) {
  //   Toast.showShortCenter("两次输入的密码不一致！");
  //   return;
  // }
  // this.setState({ showProgress: true });
  //请求服务器注册接口
  var registerUrl = Api.REGISTER_URL;
  let formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  fetch(registerUrl, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(json => {
      if (!Utils.isEmpty(json)) {
        if (json.code === 1) {
          registerToJIM(username, password);
        } else {
          // this.setState({ showProgress: false });
          // Toast.showShortCenter(json.msg);
        }
      } else {
        // this.setState({ showProgress: false });
      }
    })
    .catch(e => {
      Toast.info('聊天系统网络请求出错', 1, undefined, false);
      // Toast.showShortCenter("网络请求出错" + e);
      // this.setState({ showProgress: false });
    });
}

// 注册极光IM
function registerToJIM(username, password) {
  JMessage.register(
    {
      username: username,
      password: password
    },
    () => {
      // Toast.showShortCenter("注册成功");
      StorageUtil.set("username", { username: username });
      // 关闭当前页面
      this.props.navigation.goBack();
      // 跳转到登录界面
      // this.props.navigation.navigate("Login");

    },
    e => {
      Toast.info('聊天系统注册失败', 1, undefined, false);
      // Toast.showShortCenter("注册失败：" + e);
    }
  );
}