import React, {Component} from 'react';
import {
    View, StyleSheet, Text, TouchableOpacity, Dimensions, PixelRatio, FlatList,
    Image,
    Platform,
    Keyboard,
    BackHandler, TextInput, SafeAreaView
} from "react-native";
import api from '../service/socialApi';
import config from "../service/config";

import Global from "../util/Global";
import Utils from "../util/Utils";
import TimeUtils from "../util/TimeUtil";
import ChatBottomBar from "../views/ChatBottomBar";
import MoreView from "../views/MoreView";
import LoadingView from "../views/LoadingView";
import CountEmitter from "../event/CountEmitter";
import JMessage from "jmessage-react-plugin";
import UserInfoUtil from "../util/MessageUserInfoUtil";
import ImageAdapter from "../views/ImageAdapter";
import Config from "../service/config";
import CommonTitleBar from '../views/CommonTitleBar';
import StorageUtil from "../util/StorageUtil";
import Toast from "@ant-design/react-native/es/toast";
import AntmModal from "@ant-design/react-native/lib/modal/Modal";
import {Provider} from '@ant-design/react-native';
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import FastImage from 'react-native-fast-image'
import {KeyboardTrackingView} from 'react-native-keyboard-tracking-view';
import GlobalStyles from "../styles/Styles";
import userInfo from "../util/userInfoUtil";
import LogUtil from "../util/LogUtil";
import {Icon} from "react-native-elements";

let {width} = Dimensions.get('window');

const MSG_LINE_MAX_COUNT = 15;

class Index extends Component {
    static navigationOptions = {
        title: 'Home',
    };

    constructor(props) {
        super(props);
        this.state = {
            showEmojiView: false,
            showMoreView: false,
            showProgress: true,
            isSessionStarted: false,
            conversation: null,
            messages: [],
            vip_level: 0,
            vip_start_time: 0,
            sex: 2,
            checkStatus: 0,
            isScrollToEnd: 1,
            inputMsg: '',
            disturbTag: false
        };
        // 聊天人username或
        this.chatContactId = this.props.navigation.state.params.contactId;
        // 聊天人昵称或群名称
        this.chatUsernick = this.props.navigation.state.params.name;
        // 聊天类型，'single' or 'group'
        this.chatType = this.props.navigation.state.params.type;
        // 聊天人头像
        this.chatWithAvatar = this.props.navigation.state.params.avatar;

        // 记录当前正在聊天的id(单个用户的username或群id)
        Global.currentChattingUsername = this.chatContactId;
        Global.currentChattingType = this.chatType;

        this.username = UserInfoUtil.userInfo === null ? null : UserInfoUtil.userInfo.username;

        this.downloadTag = [];

        this.dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });
        this._layoutProvider = new LayoutProvider(
            (index) => {
                return 0;
            },
            (type, dim) => {
                dim.width = width;
                dim.height = 70;
            }
        );
        this.page = 1;
        this.timeItemTagArray = [];

        this.getDisturb(this.chatType, this.chatContactId);
    }

    setDisturb(chatType, id, isNoDisturb) {
        this.setState({
            showProgress: true
        });
        if (chatType === 'single') {
            JMessage.setNoDisturb({type: 'single', username: id, isNoDisturb: isNoDisturb},
                () => {
                    // do something.
                    this.setState({disturbTag: isNoDisturb, showProgress: false});
                }, (error) => {
                    this.setState({
                        showProgress: false
                    });
                    let code = error.code;
                    let desc = error.description;
                    console.log('qianyuan', code + "===" + desc);
                })
        } else if (chatType === 'group') {
            //文档中 参数为groupId 实际参数为 id
            JMessage.setNoDisturb(Platform.select({
                    ios: {
                        type: 'group',
                        groupId: id,
                        isNoDisturb: isNoDisturb
                    },
                    android: {
                        type: 'group',
                        id: id,
                        isNoDisturb: isNoDisturb
                    }
                }),
                () => {
                    // do something.
                    this.setState({disturbTag: isNoDisturb, showProgress: false});
                }, (error) => {
                    this.setState({
                        showProgress: false
                    });
                    let code = error.code;
                    let desc = error.description;
                    console.log('qianyuan', code + "===" + desc);
                })
        }
    }

    getDisturb(chatType, chatContactId) {
        //查看免打扰状态
        JMessage.getNoDisturbList((result) => {
            let userInfoArr = Platform.select({ios: result.userInfos, android: result.userInfoArray});
            let groupInfoArr = Platform.select({ios: result.groupInfos, android: result.groupInfoArray});
            if (chatType === 'single') {
                if (!Utils.isEmpty(userInfoArr)) {
                    userInfoArr.map((item, index) => {
                        if (item.username === chatContactId) {
                            this.setState({disturbTag: true});
                        }
                    });
                }
            } else if (chatType === 'group') {
                if (!Utils.isEmpty(groupInfoArr)) {
                    groupInfoArr.map((item, index) => {
                        //文档中 参数为groupId 实际参数为 id
                        if (item.id === chatContactId) {
                            this.setState({disturbTag: true});
                        }
                    });
                }
            }
            this.setState({
                showProgress: false
            })
        }, (error) => {
            this.setState({
                showProgress: false
            });
            let code = error.code;
            let desc = error.description;
            console.log('qianyuan', code + "===" + desc);
        });
    }

    componentDidMount() {
        const that = this;
        StorageUtil.get("vip_level", (error, vip_level) => {
            if (!error && vip_level != null) {
                that.setState({
                    vip_level
                });
            }
        });

        StorageUtil.get("vip_start_time", (error, vip_start_time) => {
            if (!error && vip_start_time != null) {
                that.setState({
                    vip_start_time
                });
            }
        });

        StorageUtil.get("sex", (error, sex) => {
            if (!error && sex != null) {
                that.setState({
                    sex
                });
            }
        });

        StorageUtil.get('check_status', function (error, object) {
            if (object !== null) {
                that.setState({
                    checkStatus: object
                })
            }
        })
    }

    componentWillMount() {
        // android需要调用进入会话的api，进入会话后android不会有通知栏消息
        if (Platform.OS === "android") {
            let options = {
                type: this.chatType,
                appKey: Global.JIMAppKey
            };
            if (this.chatType === 'chatroom') {
                options.roomId = this.chatContactId;
            } else if (this.chatType === "group") {
                options.groupId = this.chatContactId;
                // console.log('qianyuan',this.chatContactId);
                // JMessage.resetUnreadMessageCount(
                //       {
                //         type: 'group',
                //         groupId: this.chatContactId,
                //         appKey: Global.JIMAppKey
                //       },
                //       () => { },
                //       error => { }
                //   );
            } else {
                options.username = this.chatContactId;
            }
            // LogUtil.d("enterConversation: " + JSON.stringify(options));
            JMessage.enterConversation(
                options,
                conversation => {
                    // LogUtil.d("enter conversation: chat with " + this.chatUsernick);
                },
                error => {
                    // LogUtil.e("enter conversation error: " + JSON.stringify(error));
                }
            );

            // 注册返回监听器
            this.backHandler = () => {
                if (this.state.showEmojiView) {
                    this.setState({showEmojiView: false});
                    return true;
                }
                if (this.state.showMoreView) {
                    this.setState({showMoreView: false});
                    return true;
                }
            };
            BackHandler.addEventListener("hardwareBackPress", this.backHandler);
        } else if (Platform.OS === 'ios') {
            if (this.chatType === "group") {
                JMessage.resetUnreadMessageCount(
                    {
                        type: 'group',
                        groupId: this.chatContactId,
                        appKey: Global.JIMAppKey
                    },
                    () => {
                    },
                    error => {
                    }
                );
            }
        }

        this.keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            () => {
                // 键盘显示，则隐藏底部View
                this.updateView(false, false);
            }
        );

        // 加载聊天记录
        this.loadChattingMsgs();

        // 进入聊天界面后，通知会话列表刷新
        CountEmitter.emit("notifyConversationListRefresh");

        // 应用收到新消息，会触发这里的监听器，从而刷新聊天消息列表
        CountEmitter.addListener(
            "notifyChattingRefresh",
            this.notifyChattingRefreshListener
        );

        JMessage.addReceiveMessageListener(this.listener); // 添加监听
        JMessage.addSyncOfflineMessageListener(this.listener);
    }

    listener = (message) => {
        if (!Utils.isEmpty(message)) {
            if (message.type === 'text') {
                let messages = this.state.messages;
                messages.unshift(message);
                messages.reverse();
                let tags = [];
                for (let i = 0; i < messages.length; i++) {
                    let item = messages[i];

                    let time = TimeUtils.formatChatTime(parseInt(item.createTime / 1000));
                    if (tags.indexOf(time) === -1) {
                        tags.push(time);
                        item.isShowTime = true;
                    }
                }
                messages.reverse();
                this.setState({
                    messages
                }, () => {
                    this.scroll();
                });
                // this.scroll();
            }
            // 进入聊天界面后，通知会话列表刷新
            CountEmitter.emit("notifyConversationListRefresh");
        }
    };

    notifyChattingRefreshListener = () => {
        // 刷新消息
        this.loadChattingMsgs();
    };

    // 加载聊天消息列表
    loadChattingMsgs() {
        let options = {
            type: this.chatType,
            appKey: Global.JIMAppKey,
            from: 0,
            limit: -1
        };
        if (this.chatType === "chatroom") {
            options.roomId = this.chatContactId;
        } else if (this.chatType === "group") {
            options.groupId = this.chatContactId;
        } else {
            options.username = this.chatContactId;
        }
        JMessage.getHistoryMessages(
            options,
            msgArr => {
                let tags = [];
                for (let i = 0; i < msgArr.length; i++) {
                    let item = msgArr[i];

                    let time = TimeUtils.formatChatTime(parseInt(item.createTime / 1000));
                    if (tags.indexOf(time) === -1) {
                        tags.push(time);
                        item.isShowTime = true;
                    }
                }

                msgArr = msgArr.reverse();
                this.setState({
                    messages: msgArr
                });
                // let arr = this.pagination(this.page, 10, msgArr.reverse());
                // if (!Utils.isEmpty(arr)) {
                //     // this.state.messages.concat(arr);
                //     this.setState({messages: arr.reverse()}, () => {
                //         this.scroll();
                //     });
                // }
            },
            error => {
                // LogUtil.w("load all chat msg error: " + JSON.stringify(error));
            }
        );
    }


    //倒着分页
    pagination(pageNo, pageSize, array) {
        let offset = (pageNo - 1) * pageSize;
        return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    }

    _detail() {
        if (this.chatType === 'group') {
            this.props.navigation.navigate('GroupInfo', {'id': this.chatContactId});
        } else if (this.chatType === 'single') {
            this.props.navigation.navigate('DetailIndex', {id: this.chatContactId.split(config.jMessageAccountHeader)[1]});
        }
    }

    disturbBtn() {
        //true已开启免打扰
        if (this.state.disturbTag) {
            return (
                <Icon name={'bell-off-outline'} type={'material-community'}
                      iconStyle={{backgroundColor: 'white'}}
                      disabled={this.state.showProgress}
                      onPress={() => {
                          AntmModal.alert('提醒', '是否要关闭免打扰?', [{
                              text: '关闭', onPress: () => {
                                  this.setDisturb(this.chatType, this.chatContactId, false);
                              }
                          }, {text: '取消'}]);
                      }} size={25}/>
            );
        }
        //关闭免打扰
        else {
            return (
                <Icon name={'bell-ring-outline'} type={'material-community'}
                      iconStyle={{backgroundColor: 'white'}}
                      disabled={this.state.showProgress}
                      onPress={() => {
                          AntmModal.alert('提醒', '是否要开启免打扰?', [{
                              text: '开启', onPress: () => {
                                  this.setDisturb(this.chatType, this.chatContactId, true);
                              }
                          }, {text: '取消'}]);
                      }} size={25}/>
            );
        }
    }

    render() {
        let moreView = [];
        if (this.state.showEmojiView) {
            moreView.push(
                <View>
                    <View
                        style={{
                            width: width,
                            height: 1 / PixelRatio.get(),
                            backgroundColor: Global.dividerColor
                        }}
                    />
                    <View style={{height: Global.emojiViewHeight}}>
                        {/* <EmojiView /> */}
                        {/* <Emoticons
              onEmoticonPress={this._onEmoticonPress}
              onBackspacePress={this._onBackspacePress}
              show={this.state.showEmojiView}
              concise={false}
              showHistoryBar={false}
              showPlusBar={false}
            /> */}
                    </View>
                </View>
            );
        }
        if (this.state.showMoreView) {
            moreView.push(
                <View>
                    <View
                        style={{
                            width: width,
                            height: 1 / PixelRatio.get(),
                            backgroundColor: Global.dividerColor
                        }}
                    />
                    <View style={{height: Global.addViewHeight}}>
                        <MoreView sendImageMessage={this.sendImageMessage.bind(this)}/>
                    </View>
                </View>
            );
        }
        return (
            <SafeAreaView
                forceInset={{vertical: 'never', top: 'always'}}
                style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={styles.container}>
                        <CommonTitleBar title={this.chatUsernick} nav={this.props.navigation}
                                        containerStyle={{marginRight: 5}}
                                        rightSecondBtn={this.disturbBtn()}
                                        rightIcon={'dots-vertical'}
                                        handleRightClick={() => this._detail()}/>

                        {/*{this.state.showProgress ? (*/}
                        {/*    <LoadingView cancel={() => this.setState({showProgress: false})}/>*/}
                        {/*) : null}*/}

                        {/*<View style={styles.content}>*/}

                        <FlatList
                            style={styles.content}
                            inverted
                            data={this.state.messages}
                            renderItem={this.renderItem}
                            keyExtractor={this._keyExtractor}
                            extraData={this.state}
                            onScroll={this._onListScroll}
                        />
                        {/*<RecyclerListView*/}
                        {/*    ref={(flatList) =>*/}
                        {/*        this.flatList = flatList*/}
                        {/*    }*/}
                        {/*    initialRenderIndex={this.state.messages.length - 1}*/}
                        {/*    forceNonDeterministicRendering*/}
                        {/*    layoutProvider={this._layoutProvider}*/}
                        {/*    dataProvider={this.dataProvider.cloneWithRows(this.state.messages)}*/}
                        {/*    rowRenderer={this.renderItem}*/}
                        {/*    extendedState={this.state}*/}
                        {/*/>*/}
                        {/*</View>*/}

                        <KeyboardTrackingView
                            addBottomView
                            manageScrollView
                            scrollBehavior={2} // KeyboardTrackingScrollBehaviorFixedOffset
                            style={styles.trackingView}
                            requiresSameParentToManageScrollView
                            // bottomViewColor={themes[theme].messageboxBackground}
                        >
                            <View style={styles.divider}/>
                            <View style={styles.bottomBar}>
                                <TextInput
                                    ref={(input) => this.input = input}
                                    value={this.state.inputMsg}
                                    onChangeText={text => {
                                        this.setState({inputMsg: text});
                                    }}
                                    style={{
                                        padding: 5,
                                        fontSize: 20,
                                        flex: 1,
                                        backgroundColor: 'white',
                                        borderRadius: 3,
                                        margin: 5,
                                        borderWidth: 1,
                                        borderColor: 'white',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    selectionColor={'#49BC1C'}
                                    multiline={true}
                                />
                                <TouchableOpacity style={{marginLeft: 10}} activeOpacity={0.6} onPress={() => {
                                    if (!Utils.isEmpty(this.state.inputMsg.trim())) {
                                        this.handleSendBtnClick(this.state.inputMsg.trim());
                                    }
                                }}>
                                    <View style={{
                                        backgroundColor: '#49BC1C',
                                        height: 40,
                                        width: width / 6,
                                        borderRadius: 3,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <Text style={{
                                            color: "#ffffff",
                                            fontSize: 16,
                                            // marginBottom: 5
                                        }}>发送</Text>
                                    </View>
                                </TouchableOpacity>
                                {/*<ChatBottomBar*/}
                                {/*    ref="chatBottomBar"*/}
                                {/*    vip_level={this.state.vip_level}*/}
                                {/*    sex={this.state.sex}*/}
                                {/*    updateView={this.updateView}*/}
                                {/*    nav={this.props.navigation}*/}
                                {/*    handleSendBtnClick={this.handleSendBtnClick}*/}
                                {/*/>*/}
                            </View>
                        </KeyboardTrackingView>
                        {moreView}
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }

    _onListScroll = () => {
        // list滑动时，隐藏底部的View
        if (this.state.showEmojiView) {
            this.setState({showEmojiView: false});
        }
        if (this.state.showMoreView) {
            this.setState({showMoreView: false});
        }
    };

    _onEmoticonPress = data => {
        // 选择了某个emoji表情，将该表情追加到输入框中
        this.refs.chatBottomBar.appendMsg(data.code);
    };

    _onBackspacePress = () => {
    };

    // 发送按钮
    handleSendBtnClick = msg => {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else if (this.state.checkStatus === 0) {
            AntmModal.alert('提醒', '您的资料将在24小时内审核完毕', [{text: '知道了'}])
        } else if (this.state.checkStatus === 2) {
            AntmModal.alert('提醒', '很遗憾，您的资料未通过审核', [{text: '取消'}, {
                text: '前往修改', onPress: () => this.props.navigation.navigate('EditWdIndex')
            }])
        } else if (config.state === '1' && config.sex === '0' && this.state.vip_level === 0) {
            Toast.info('该功能需要会员才能使用', 1, undefined, false);
            this.props.navigation.navigate('Price');
        }
            // else if (config.state === '1' && config.sex === '1' && !this.state.par_for_message) {
            //   this.setState({
            //     coinViewState: true
            //   });
        // }
        else if (config.state === '1' && config.sex === '0' && this.state.vip_level > 0) {
            console.log(config.sex + '========0000000000000=========' + this.state.vip_level);
            this.setState({inputMsg: ""});
            this.sendTextMessage(msg);
        } else if (config.state === '1' && config.sex === '1') {
            console.log(config.sex + '========1111111111111111111=========' + this.state.vip_level);
            this.setState({inputMsg: ""});
            this.sendTextMessage(msg);
        }
    };

    sendTextMessage(message) {
        let options = {
            type: this.chatType,
            appKey: Global.JIMAppKey,
            text: message,
            messageSendingOptions: JMessage.messageSendingOptions
        };
        if (this.chatType === "chatroom") {
            options.roomId = this.chatContactId;
        } else if (this.chatType === "group") {
            options.groupId = this.chatContactId;
        } else {
            options.username = this.chatContactId;
        }
        // 发送文本消息
        JMessage.sendTextMessage(
            options,
            msg => {
                this.concatMessage(msg);
            },
            error => {
                // LogUtil.e("send text msg error: " + JSON.stringify(error));
                // console.log('qianyuan', error.code + '=' + error.description);
                /*
                * 错误码1 表示创建消息失败， 账户已在它处登录
                * */
                if (error.code === 1) {
                    userInfo.logout();
                    AntmModal.alert('提醒', '当前未登录,您是否已在其他设备登录过?', [{
                        text: '知道了',
                        onPress: () => this.props.navigation.goBack()
                    }]);
                }
            }
        );
    }

    // image参数格式如下
    // {
    //   "size": 49381,
    //   "mime": "image/jpeg",
    //   "height": 580,
    //   "width": 580,
    //   "modificationDate": "1543192765000",
    //   "path": "file:///storage/emulated/0/Pictures/知乎/v2-812bcc48fe03024752a79f6e61d333e9.jpg"
    // }
    sendImageMessage(image) {
        if (image && image.path) {
            let options = {
                type: this.chatType,
                appKey: Global.JIMAppKey,
                path: image.path.replace("file://", ""),
                messageSendingOptions: JMessage.messageSendingOptions
            };
            if (this.chatType === "chatroom") {
                options.roomId = this.chatContactId;
            } else if (this.chatType === "group") {
                options.groupId = this.chatContactId;
            } else {
                options.username = this.chatContactId;
            }
            // 发送图片消息
            JMessage.sendImageMessage(
                options,
                msg => {
                    this.concatMessage(msg);
                    // LogUtil.d("send image msg success: " + JSON.stringify(msg));
                },
                error => {
                    // LogUtil.e("send image msg error: " + JSON.stringify(error));
                }
            );
        }
    }

    // 如果页面能滑动，将页面滑动到最底部
    scroll() {
        // this.scrollTimeout = setTimeout(() => this.flatList.scrollToEnd({animated: false}), 500);
    }

    // 合并消息
    concatMessage(newMsg) {
        let msgArr = this.state.messages;
        msgArr.unshift(newMsg);
        msgArr.reverse();
        let tags = [];
        for (let i = 0; i < msgArr.length; i++) {
            let item = msgArr[i];

            let time = TimeUtils.formatChatTime(parseInt(item.createTime / 1000));
            if (tags.indexOf(time) === -1) {
                tags.push(time);
                item.isShowTime = true;
            }
        }
        msgArr.reverse();
        this.setState({messages: msgArr}, () => {
            this.scroll();
        });
        // 发送完消息，还要通知会话列表更新
        CountEmitter.emit("notifyConversationListRefresh");
    }

    updateView = (emoji, more) => {
        this.setState(
            {
                showEmojiView: emoji,
                showMoreView: more
            },
            () => {
                if (emoji || more) {
                    Keyboard.dismiss();
                }
            }
        );
    };

    _keyExtractor = (item, index) => "list-item-" + index;

    shouldShowTime(item, index) {
        // 该方法判断当前消息是否需要显示时间
        if (this.chatType === "group" && index === 2) {
            return true;
        }
        // let index = item.id;
        if (index === 1) {
            // 第一条消息，显示时间
            return true;
        }
        if (index > 1 && this.state.messages.length - 1 >= index + 2) {
            let messages = this.state.messages;
            if (!Utils.isEmpty(messages) && messages.length > 0) {
                let preMsg = messages[index + 2];
                let delta = (item.createTime - preMsg.createTime) / 1000;
                if (delta > 3 * 60) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    // 是否是我发出的消息
    isMyMsg(item) {
        return item.from.username === this.username;
    }

    renderItem = ({item, index, separators}) => {
        let msgType = item.type;
        if (msgType === "text") {
            // 文本消息
            if (!this.isMyMsg(item)) {
                return this.renderReceivedTextMsg(item, index);
            } else {
                return this.renderSendTextMsg(item, index);
            }
        } else if (msgType === "image") {
            // 图片消息
            if (!this.isMyMsg(item)) {
                return this.renderReceivedImgMsg(item);
            } else {
                return this.renderSendImgMsg(item);
            }
        }
    };

    // renderItem = (type, item, index) => {
    //     let msgType = item.type;
    //     if (msgType === "text") {
    //         // 文本消息
    //         if (!this.isMyMsg(item)) {
    //             return this.renderReceivedTextMsg(item, index);
    //         } else {
    //             return this.renderSendTextMsg(item, index);
    //         }
    //     } else if (msgType === "image") {
    //         // 图片消息
    //         if (!this.isMyMsg(item)) {
    //             return this.renderReceivedImgMsg(item);
    //         } else {
    //             return this.renderSendImgMsg(item);
    //         }
    //     }
    // };

    // 渲染接收的文本消息
    renderReceivedTextMsg(item, index) {
        let contactAvatar = require("../images/benutzer.png");
        if (this.chatType === "group") {
            // 群聊的头像为某个人的头像
            contactAvatar = config.host + '/api/v1/img/' + item.from.username.split(config.jMessageAccountHeader)[1];
            // let thumb = item.from.avatarThumbPath;
            // if (thumb) {
            //     contactAvatar = thumb;
            // } else {
            //     this.downloadUserAvatarThumb(item.from.username, 'single');
            // }
        } else {
            // 单聊的头像
            if (!Utils.isEmpty(this.chatWithAvatar)) {
                contactAvatar = this.chatWithAvatar;
            }
        }
        return (
            <View style={{flex: 1, width: width, alignItems: "center"}}>
                {item.isShowTime ? (
                    <Text style={listItemStyle.time}>
                        {TimeUtils.formatChatTime(parseInt(item.createTime / 1000))}
                    </Text>
                ) : null}
                {/*{this.shouldShowTime(item, index) ? (*/}
                {/*    <Text style={listItemStyle.time}>*/}
                {/*        {TimeUtils.formatChatTime(parseInt(item.createTime / 1000))}*/}
                {/*    </Text>*/}
                {/*) : null}*/}
                <View style={listItemStyle.container}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate('DetailIndex', {id: item.from.username.split(config.jMessageAccountHeader)[1]})}>
                        {typeof (contactAvatar) != 'string' ?
                            <ImageAdapter path={contactAvatar} width={40} height={40}/> :
                            <FastImage style={{width: 40, height: 40, borderRadius: 5}}
                                       source={{
                                           uri: contactAvatar,
                                           headers: {Authorization: config.access_token},
                                       }}/>}
                    </TouchableOpacity>
                    <View style={listItemStyle.msgContainer}>
                        <Text style={listItemStyle.msgText}>
                            {Utils.spliceStr(item.text, MSG_LINE_MAX_COUNT)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    downloadUserAvatarThumb(uname, type) {
        let that = this;
        let id = uname.split(config.jMessageAccountHeader)[1];
        if (type === 'group') {
            id = uname;
        }
        if (id !== 0) {
            StorageUtil.get(id, (error, object) => {
                if (object != null) {
                    const path = object.path;
                    let list = that.state.messages;
                    for (let i = 0; i < list.length; i++) {
                        let conv = list[i];
                        if (type === 'group') {
                            if (
                                Utils.isEmpty(conv.target.nickname) &&
                                conv.target.avatarThumbPath !== path && uname === conv.target.id
                            ) {
                                // LogUtil.d(`${uname}用户头像发生了改变，更新会话列表...`);
                                conv.target.nickname = object.nickname;
                                conv.target.avatarThumbPath = path;
                                that.setState({
                                    messages: list
                                });
                            }
                        } else if (type === 'single') {
                            if (
                                Utils.isEmpty(conv.from.nickname) &&
                                conv.from.avatarThumbPath !== path && uname === conv.from.username
                            ) {
                                // LogUtil.d(`${uname}用户头像发生了改变，更新会话列表...`);
                                conv.from.nickname = object.nickname;
                                conv.from.avatarThumbPath = path;
                                that.setState({
                                    messages: list
                                });
                            }
                        }
                    }
                } else {
                    if (!this.downloadTag.includes(id)) {
                        this.downloadTag.push(id);
                        if (type === 'group') {
                            api.getGroupAvatarByGID(JSON.stringify({'groupId': id})).then(
                                function (message) {
                                    if (message.code === 200) {
                                        let path = config.host + message.data.photo;
                                        const nickname = message.data.nickname;
                                        StorageUtil.set(id, {path, nickname});
                                        // 如果头像有变化，则更新会话列表
                                        let list = that.state.messages;
                                        for (let i = 0; i < list.length; i++) {
                                            let conv = list[i];
                                            if (
                                                Utils.isEmpty(conv.target.nickname) &&
                                                conv.target.avatarThumbPath !== path && uname === conv.target.username
                                            ) {
                                                // LogUtil.d(`${uname}用户头像发生了改变，更新会话列表...`);
                                                conv.target.nickname = message.data.nickname;
                                                conv.target.avatarThumbPath = path;
                                                that.setState({
                                                    messages: list
                                                });
                                            }
                                        }
                                    }
                                },
                                function (error) {
                                }).done();
                        } else {
                            api.getUserNickNameByUID(JSON.stringify({id})).then(
                                function (message) {
                                    if (message.code === 200) {
                                        let path = config.host + JSON.parse(message.data.photo)[0];
                                        const nickname = message.data.nickname;
                                        StorageUtil.set(id, {path, nickname});
                                        // 如果头像有变化，则更新会话列表
                                        let list = that.state.messages;
                                        for (let i = 0; i < list.length; i++) {
                                            let conv = list[i];
                                            if (
                                                Utils.isEmpty(conv.from.nickname) &&
                                                conv.from.avatarThumbPath !== path && uname === conv.from.username
                                            ) {
                                                // LogUtil.d(`${uname}用户头像发生了改变，更新会话列表...`);
                                                conv.from.nickname = message.data.nickname;
                                                conv.from.avatarThumbPath = path;
                                                that.setState({
                                                    messages: list
                                                });
                                            }
                                        }
                                    }
                                },
                                function (error) {
                                }).done();
                        }
                    }
                }
            });
        }
    }

    // 渲染发送出去的文本消息
    renderSendTextMsg(item, index) {
        // let avatar = require("../images/avatar.png");
        let avatar = Config.host + Config.lifephotos;
        if (!Utils.isEmpty(UserInfoUtil.userInfo.avatarThumbPath)) {
            avatar = UserInfoUtil.userInfo.avatarThumbPath;
        }
        // 发送出去的消息
        return (
            <View style={{flex: 1, width: width, flexDirection: "column", alignItems: "center"}}>
                {item.isShowTime === true ? (
                    <Text style={listItemStyle.time}>
                        {TimeUtils.formatChatTime(parseInt(item.createTime / 1000))}
                    </Text>
                ) : null}
                {/*{this.shouldShowTime(item, index) ? (*/}
                {/*    <Text style={listItemStyle.time}>*/}
                {/*        {TimeUtils.formatChatTime(parseInt(item.createTime / 1000))}*/}
                {/*    </Text>*/}
                {/*) : null}*/}
                <View style={listItemStyle.containerSend}>
                    <View style={listItemStyle.msgContainerSend}>
                        <Text style={listItemStyle.msgText}>
                            {Utils.spliceStr(item.text, MSG_LINE_MAX_COUNT)}
                        </Text>
                    </View>
                    {/* <Image style={listItemStyle.avatar} source={avatar} /> */}

                    {/*<ImageAdapter width={40} height={40} path={avatar}/>*/}
                    <FastImage style={{width: 40, height: 40, borderRadius: 5}}
                               source={{uri: avatar, headers: {Authorization: config.access_token}}}/>
                </View>
            </View>
        );
    }

    // 渲染接收的图片消息
    renderReceivedImgMsg(item) {
        // let contactAvatar = require("../images/avatar.png");
        let contactAvatar = Config.host + Config.lifephotos;

        if (this.chatType === "group") {
            // 群聊的头像为某个人的头像
            contactAvatar = config.host + '/api/v1/img/' + item.from.username.split(config.jMessageAccountHeader)[1];
            console.log('qianyuan', contactAvatar);
            // let thumb = item.from.avatarThumbPath;
            // if (thumb) {
            //     contactAvatar = thumb;
            // }
        } else {
            // 单聊的头像
            if (!Utils.isEmpty(this.chatWithAvatar)) {
                contactAvatar = this.chatWithAvatar;
            }
        }
        return (
            <View style={{flexDirection: "column", alignItems: "center"}}>
                {this.shouldShowTime(item) ? (
                    <Text style={listItemStyle.time}>
                        {TimeUtils.formatChatTime(parseInt(item.createTime / 1000))}
                    </Text>
                ) : null}
                <View style={listItemStyle.container}>
                    <FastImage style={{width: 40, height: 40, borderRadius: 5}}
                               source={{uri: contactAvatar, headers: {Authorization: config.access_token}}}/>
                    {/*<ImageAdapter width={40} height={40} path={contactAvatar}/>*/}
                    {/* <Image style={listItemStyle.avatar} source={contactAvatar} /> */}
                    <View
                        style={[
                            listItemStyle.msgContainer,
                            {paddingLeft: 0, paddingRight: 0}
                        ]}
                    >
                        <Image
                            source={{uri: "file://" + item.thumbPath}}
                            style={{
                                width: 150,
                                height: 150
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    }

    // 渲染发送的图片消息
    renderSendImgMsg(item) {
        // let avatar = require("../images/avatar.png");
        let avatar = Config.host + Config.lifephotos;
        if (!Utils.isEmpty(UserInfoUtil.userInfo.avatarThumbPath)) {
            avatar = UserInfoUtil.userInfo.avatarThumbPath;
        }
        return (
            <View style={{flexDirection: "column", alignItems: "center"}}>
                {this.shouldShowTime(item) ? (
                    <Text style={listItemStyle.time}>
                        {TimeUtils.formatChatTime(parseInt(item.createTime / 1000))}
                    </Text>
                ) : null}
                <View style={listItemStyle.containerSend}>
                    <View
                        style={[
                            listItemStyle.msgContainerSend,
                            {paddingLeft: 0, paddingRight: 0}
                        ]}
                    >
                        <Image
                            source={{uri: "file://" + item.thumbPath}}
                            style={{
                                borderRadius: 3,
                                width: 150,
                                height: 150
                            }}
                        />
                    </View>
                    <ImageAdapter width={40} height={40} path={avatar}/>
                    {/* <Image style={listItemStyle.avatar} source={avatar} /> */}
                </View>
            </View>
        );
    }

    componentWillUnmount() {
        if (Platform.OS === "android") {
            JMessage.exitConversation();
            BackHandler.removeEventListener("hardwareBackPress", this.backHandler);
        }
        this.scrollTimeout && clearTimeout(this.scrollTimeout);
        CountEmitter.removeListener(
            "notifyChattingRefresh",
            this.notifyChattingRefreshListener
        );
        Global.currentChattingUsername = null;
        Global.currentChattingType = null;
        this.keyboardDidShowListener.remove();
        JMessage.removeReceiveMessageListener(this.listener);
        JMessage.removeSyncOfflineMessageListener(this.listener);
    }

}

const
    listItemStyle = StyleSheet.create({
        container: {
            flex: 1,
            width: width,
            flexDirection: "row",
            padding: 5
        },
        avatar: {
            width: 40,
            height: 40
        },
        msgContainer: {
            backgroundColor: "#FFFFFF",
            borderRadius: 3,
            paddingLeft: 8,
            paddingRight: 8,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 5
        },
        msgContainerSend: {
            // backgroundColor: GlobalStyles.bgColor,
            backgroundColor: "#9FE658",
            borderRadius: 3,
            paddingLeft: 8,
            paddingRight: 8,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 5
        },
        msgText: {
            fontSize: 15,
            lineHeight: 24,
            maxWidth: width - 120
        },
        containerSend: {
            flex: 1,
            width: width,
            flexDirection: "row",
            padding: 5,
            justifyContent: "flex-end"
        },
        time: {
            // backgroundColor: "#D4D4D4",
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 4,
            paddingBottom: 4,
            borderRadius: 5,
            // color: "#FFFFFF",
            color: 'gray',
            marginTop: 10,
            fontSize: 11
        }
    });

const
    styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            flex: 1,
            // flexDirection: "column",
            // alignItems: "flex-start",
            backgroundColor: Global.pageBackgroundColor
        },
        bottomBar: {
            // minHeight: 50,
            // height: 50,
            maxHeight: 160,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: 'center',
            backgroundColor: Global.pageBackgroundColor,
            paddingLeft: 10,
            paddingRight: 10,
            // marginTop: 5,
            // marginBottom: 5,
        },
        divider: {
            width: width,
            height: 1 / PixelRatio.get(),
            backgroundColor: Global.dividerColor
        },
        trackingView: {
            ...Platform.select({
                ios: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                }
            })
        }
    });

export default Index;
