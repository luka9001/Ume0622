import React, {Component} from 'react';
import TitleBar from '../views/TitleBar';

import {
    Image, StyleSheet, Text, View, Dimensions, PixelRatio, FlatList, TouchableHighlight, SafeAreaView
} from 'react-native';
import api from '../service/socialApi';
import config from '../service/config';

import Global from '../util/Global';
import Utils from '../util/Utils';
import LogUtil from '../util/LogUtil';
import DBHelper from '../util/DBHelper';
import ImageAdapter from '../views/ImageAdapter';
import CountEmitter from '../event/CountEmitter';
import StorageUtil from '../util/StorageUtil';
import TimeUtil from '../util/TimeUtil';

import JMessage from 'jmessage-react-plugin';
import {LayoutProvider, DataProvider, RecyclerListView} from 'recyclerlistview';
import {withNavigationFocus} from 'react-navigation';
import LoadingView from '../views/LoadingView';
import {Modal} from '@ant-design/react-native';
import UserInfoApi from '../service/UserInfoApi';
import FastImage from 'react-native-fast-image';
import userInfo from '../util/userInfoUtil';

const {width} = Dimensions.get('window');

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            checkedUpgrade: true, // 标记是否检查了更新，这里置为true则不会检查更新，设置为false则每次启动时检查更新，该功能默认不开启
            recentConversation: [],
        };
        this.registerJIMListener();

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
            },
        );
    }

    // 加载当前用户的会话
    loadConversations() {
        this.setState({visible: true});
        JMessage.getConversations(
            conArr => {
                // conArr: 会话数组。
                // 刷新会话列表
                if (conArr != null && conArr.length > 0) {
                    // LogUtil.d("conversation list: " + JSON.stringify(conArr));
                    let showList = false;
                    let unreadTag = false;
                    for (let i = 0; i < conArr.length; i++) {
                        // LogUtil.w(JSON.stringify(conArr[i]));
                        // 这里可以取到会话，但是删除好友后，会话里没有latestMessage，如果所有的会话都没有latestMessage，则不显示会话列表
                        if (conArr[i].latestMessage) {
                            showList = true;
                        }
                        // 如果当前正在跟这个人聊天，则重置该人的未读消息数
                        if (Global.currentChattingUsername === conArr[i].target.username) {
                            conArr[i].unreadCount = 0;
                            JMessage.resetUnreadMessageCount(
                                {
                                    type: Global.currentChattingType,
                                    username: Global.currentChattingUsername,
                                    appKey: Global.JIMAppKey,
                                },
                                () => {
                                },
                                error => {
                                },
                            );
                        } else if (Global.currentChattingUsername === conArr[i].target.id) {
                            conArr[i].unreadCount = 0;
                            JMessage.resetUnreadMessageCount(
                                {
                                    type: Global.currentChattingType,
                                    username: Global.currentChattingUsername,
                                    appKey: Global.JIMAppKey,
                                },
                                () => {
                                },
                                error => {
                                },
                            );
                        }
                        if (conArr[i].unreadCount > 0) {
                            unreadTag = true;
                        }

                        console.log('接受到新消息');
                    }
                    if (showList) {
                        this.setState({recentConversation: conArr});
                    }
                    Global.JMessageCount = unreadTag;
                }
                this.setState({visible: false});
            },
            error => {
                this.setState({visible: false});
                let code = error.code;
                let desc = error.description;
                console.log('qianyuan', code + '=' + desc);
                if (error.code === 863004) {
                    userInfo.logout();
                    Modal.alert('提醒', '当前未登录,您是否已在其他设备登录过?', [
                        {text: '我知道了'},
                    ]);
                }

                // Modal.alert('提醒', '聊天数据加载失败，请再次尝试', [
                //     {text: '我知道了'},
                // ]);
            },
        );
    }

    // 注册极光IM的监听器
    registerJIMListener() {
        // 收到消息的监听
        this.receiveMessageListener = msg => {
            if (msg.type === 'text') {
                // 文本消息，消息格式参考jsons/txtmsg.json
            } else if (msg.type === 'image') {
                // 图片消息，消息格式参考jsons/imagemsg.json
            }
            LogUtil.d('receive msg: ' + JSON.stringify(msg));
            // 收到新的消息，重新加载会话列表
            this.loadConversations();
            // 如果打开了聊天界面，还要通知聊天界面刷新
            // CountEmitter.emit("notifyChattingRefresh");
        };
        JMessage.addReceiveMessageListener(this.receiveMessageListener);

        // 添加好友的消息监听
        this.addFriendListener = event => {
            // event: {"fromUserAppKey":"e621de6a04c96f0dd590b9b5","fromUsername":"jackson","reason":"杰克逊请求添加好友","type":"invite_accepted"}
            // 添加该消息到数据库
            DBHelper.insertAddFriendMsg(event.fromUsername, event.reason, event.type);
            // 通知界面刷新红点
            CountEmitter.emit('refreshRedDot');
            LogUtil.d('receive add friend msg: ' + JSON.stringify(event));
        };
        JMessage.addContactNotifyListener(this.addFriendListener);
    }

    componentWillMount() {
        CountEmitter.addListener(
            'notifyConversationListRefresh',
            this.notifyConversationListRefreshListener,
        );

        CountEmitter.addListener(
            'notifyLogin',
            this.notifyLogin,
        );
    }

    notifyConversationListRefreshListener = () => {
        // 重新加载会话
        this.loadConversations();
    };

    notifyLogin = () => {
        console.log('登录信号');
        this.load();
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <View style={styles.container}>
                    {/*{this.state.visible ? (*/}
                    {/*    <LoadingView*/}
                    {/*        cancel={() => this.setState({visible: false})}*/}
                    {/*    />*/}
                    {/*) : null}*/}
                    <TitleBar title={'消息'} nav={this.props.navigation} isfilter={false}/>
                    <View style={styles.divider}/>
                    <View style={styles.content}>
                        {/*<RecyclerListView*/}
                        {/*    forceNonDeterministicRendering*/}
                        {/*    layoutProvider={this._layoutProvider}*/}
                        {/*    dataProvider={this.dataProvider.cloneWithRows(this.state.recentConversation)}*/}
                        {/*    rowRenderer={this.renderItem}*/}
                        {/*    extendedState={this.state}*/}
                        {/*/>*/}

                        {/*{this.state.recentConversation.length === 0 ? (*/}
                        {/*    <Text style={styles.emptyHintText}>暂无会话消息</Text>*/}
                        {/*) : (*/}
                        <FlatList
                            extraData={this.state}
                            data={this.state.recentConversation}
                            renderItem={this.renderItem}
                            keyExtractor={this._keyExtractor}
                        />
                        {/*)}*/}
                    </View>
                    <View style={styles.divider}/>
                    <View
                        style={{
                            backgroundColor: 'transparent',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: width,
                        }}
                    >
                        {/* <UpgradeDialog
            ref="upgradeDialog"
            content={this.state.upgradeContent}
          />  */}
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    _keyExtractor = (item, index) => 'conversation-' + index;

    componentWillReceiveProps(newProps) {
        if (newProps.isFocused) {
            this.load();
            return true;
        } else {
            return false;
        }
    }

    load() {
        // if (newProps.isFocused) {
        UserInfoApi.getUserInfo();
        StorageUtil.get('username', (error, object) => {
            // if (!error && object && object.username) {
            //     this.setState({username: object.username});
            // }
            if (object !== null) {
                if (object.name !== null) {
                    this.setState({username: object.username});
                }
            }
        });
        StorageUtil.get('hasLogin', (error, object) => {
            // alert(object.hasLogin);
            if (object === null) {
                this.setState({
                    recentConversation: [],
                });
            } else {
                if (!object.hasLogin) {
                    this.setState({
                        recentConversation: [],
                    });
                } else if (object.hasLogin) {
                    this.setState({
                        recentConversation: [],
                    });
                    this.loadConversations();
                }
            }
        });
    }

    componentDidMount() {
        // this.load();

        // this.loadConversations();

        // StorageUtil.get("username", (error, object) => {
        //   if (!error && object && object.username) {
        //     this.setState({ username: object.username });
        //     // this.loadConversations(object.username);
        //   }
        // });


        // 组件挂载完成后检查是否有更新，只针对Android平台检查
        // if (!this.state.checkedUpgrade) {
        //   if (Platform.OS === "android") {
        //     UpgradeModule.getVersionCodeName((versionCode, versionName) => {
        //       if (versionCode > 0 && !Utils.isEmpty(versionName)) {
        //         // 请求服务器查询更新
        //         let url =
        //           Api.ANDROID_UPGRADE_URL +
        //           "?versionCode=" +
        //           versionCode +
        //           "&versionName=" +
        //           versionName;
        //         fetch(url)
        //           .then(res => res.json())
        //           .then(json => {
        //             if (json != null && json.code == 1) {
        //               // 有新版本
        //               let data = json.msg;
        //               if (data != null) {
        //                 let newVersionCode = data.versionCode;
        //                 let newVersionName = data.versionName;
        //                 let newVersionDesc = data.versionDesc;
        //                 let downUrl = data.downUrl;
        //                 let content =
        //                   "版本号：" +
        //                   newVersionCode +
        //                   "\n\n版本名称：" +
        //                   newVersionName +
        //                   "\n\n更新说明：" +
        //                   newVersionDesc;
        //                 this.setState({ upgradeContent: content }, () => {
        //                   // 显示更新dialog
        //                   this.refs.upgradeDialog.showModal();
        //                 });
        //               }
        //             }
        //           })
        //           .catch(e => { });
        //       }
        //     });
        //   }
        //   this.setState({ checkedUpgrade: true });
        // }
    }

    renderItem = ({item}) => {
        if (!item.latestMessage) {
            return null;
        }

        // 会话类型（单聊或群聊）
        let type = item.conversationType;
        let target = item.target;
        let lastMsg = item.latestMessage;
        let lastTime = lastMsg.createTime / 1000;

        let contactId;
        let nick;
        let avatar;
        if (type === 'chatroom') {
            // 群聊
            contactId = target.roomId; // groupId
            nick = item.title; // 群名称
            // avatar = require("../images/ic_group_chat.png"); // 群头像

            // if (nick === '西班牙') {
            //   avatar = require("../images/spanish_group.png")
            // }
            // else {
            avatar = require('../images/group.png');
            // }
            if (!Utils.isEmpty(target.avatarThumbPath)) {
                avatar = target.avatarThumbPath;
            }
        } else if (type === 'group') {
            // 群聊
            contactId = target.id; // groupId
            nick = item.title; // 群名称
            // avatar = require("../images/ic_group_chat.png"); // 群头像
            // if (nick === '西班牙') {
            //   avatar = require("../images/spanish_group.png")
            // }
            // else {
            // avatar = require("../images/group.png")
            // }

            avatar = config.host + '/api/v1/groupimg/' + contactId;
            if (!Utils.isEmpty(target.avatarThumbPath)) {
                avatar = target.avatarThumbPath;
            }
        } else {
            // 单聊
            contactId = target.username; // 聊天人的username
            nick = target.nickname;
            if (Utils.isEmpty(nick)) {
                nick = contactId;
            }
            let _id = contactId.split(config.jMessageAccountHeader)[1];
            avatar = config.host + '/api/v1/img/' + _id;
            // avatar = require("../images/benutzer.png");
            // if (!Utils.isEmpty(target.avatarThumbPath)) {
            //     avatar = target.avatarThumbPath;
            // }
        }

        // if (type === "single") {
        //     //极光端获取头像，上传极光id
        //     // this.downloadUserAvatarThumb(contactId);
        //     //自己服务端获取头像，获取
        //
        //     this.downloadUserAvatarThumb(contactId, type);
        // } else if (type === 'group') {
        //     this.downloadUserAvatarThumb(contactId, type);
        // }
        // 显示出来的最后一条消息
        let lastMsgContent = '';
        if (lastMsg.type === 'text') {
            lastMsgContent = lastMsg.text;
        } else if (lastMsg.type === 'image') {
            lastMsgContent = '[图片]';
        }

        return (
            <View style={{flex: 1}}>
                <TouchableHighlight
                    underlayColor={Global.touchableHighlightColor}
                    onPress={() => {
                        this.props.navigation.navigate('Chatting', {
                            contactId: contactId,
                            name: nick,
                            avatar: avatar,
                            type: type,
                        });
                    }}
                >
                    <View style={styles.listItemContainer}>
                        {typeof (avatar) != 'string' ? <ImageAdapter path={avatar} width={50} height={50}/> :
                            <FastImage style={{width: 50, height: 50, borderRadius: 5}}
                                       source={{uri: avatar, headers: {Authorization: config.access_token}}}/>
                        }
                        <View style={styles.listItemTextContainer}>
                            <View style={styles.listItemSubContainer}>
                                <Text numberOfLines={1} style={styles.listItemTitle}>
                                    {nick}
                                </Text>
                                <Text numberOfLines={1} style={styles.listItemTime}>
                                    {TimeUtil.formatChatTime(lastTime)}
                                </Text>
                            </View>
                            <View style={styles.listItemSubContainer}>
                                <Text numberOfLines={1} style={styles.listItemSubtitle}>
                                    {lastMsgContent}
                                </Text>
                                {item.unreadCount > 0 ? (
                                    <View style={styles.redDot}>
                                        <Text style={styles.redDotText}>{item.unreadCount}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>
                </TouchableHighlight>
                <View style={styles.divider}/>
            </View>
        );
    };

    isContainAvatar(id) {
        this.avatarList.forEach(element => {
            if (element.id === id) {
                return element.path;
            }
        });
        return false;
    };

    // 下载用户头像
    downloadUserAvatarThumb(uname, type) {
        let that = this;
        let id = uname.split(config.jMessageAccountHeader)[1];
        if (type === 'group') {
            id = uname;
        }

        if (type === 'group') {
            api.getGroupAvatarByGID(JSON.stringify({'groupId': id})).then(
                function (message) {
                    if (message.code === 200) {
                        let path = message.data.photo;
                        const nickname = message.data.nickname;
                        // StorageUtil.set(id, {path, nickname});
                        // 如果头像有变化，则更新会话列表
                        let list = that.state.recentConversation;
                        for (let i = 0; i < list.length; i++) {
                            let conv = list[i];
                            if (
                                // Utils.isEmpty(conv.target.nickname) &&
                                conv.target.avatarThumbPath !== config.host + path && uname === conv.target.username
                            ) {
                                // LogUtil.d(`${uname}用户头像发生了改变，更新会话列表...`);
                                conv.target.nickname = message.data.nickname;
                                conv.target.avatarThumbPath = config.host + path;
                                // that.setState({
                                //   recentConversation: list
                                // });
                            }
                        }
                        that.setState({
                            recentConversation: list,
                        });
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
                        // StorageUtil.set(id, {path, nickname});
                        // 如果头像有变化，则更新会话列表
                        let list = that.state.recentConversation;
                        for (let i = 0; i < list.length; i++) {
                            let conv = list[i];
                            if (
                                // Utils.isEmpty(conv.target.nickname) &&
                                uname === conv.target.username
                            ) {

                                // LogUtil.d(`${uname}用户头像发生了改变，更新会话列表...`);
                                conv.target.nickname = message.data.nickname;
                                conv.target.avatarThumbPath = path;
                            }
                        }
                        that.setState({
                            recentConversation: list,
                        });
                    }
                },
                function (error) {
                }).done();
        }
    }

    unregisterListeners() {
        CountEmitter.removeListener(
            'notifyConversationListRefresh',
            this.notifyConversationListRefreshListener,
        );
        CountEmitter.removeListener(
            'notifyLogin',
            this.notifyLogin,
        );

        // 移除接收消息的监听器
        if (this.receiveMessageListener) {
            JMessage.removeReceiveMessageListener(this.receiveMessageListener);
        }
        // 移除加好友的监听器
        if (this.addFriendListener) {
            JMessage.removeContactNotifyListener(this.addFriendListener);
        }
    }

    componentWillUnmount() {
        // Toast.info('未注册', 1, undefined, false);
        this.unregisterListeners();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        width: width,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor,
    },
    content: {
        flex: 1,
        width: width,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Global.pageBackgroundColor,
    },
    listItemContainer: {
        flexDirection: 'row',
        width: width,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    listItemTextContainer: {
        flexDirection: 'column',
        flex: 1,
        paddingLeft: 15,
    },
    listItemSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listItemTitle: {
        color: '#333333',
        fontSize: 16,
        flex: 1,
    },
    listItemTime: {
        color: '#999999',
        fontSize: 12,
    },
    listItemSubtitle: {
        color: '#999999',
        fontSize: 14,
        marginTop: 3,
        flex: 1,
    },
    redDot: {
        borderRadius: 90,
        width: 18,
        height: 18,
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    redDotText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    emptyHintText: {
        fontSize: 18,
        color: '#999999',
    },
});

export default withNavigationFocus(Index);
