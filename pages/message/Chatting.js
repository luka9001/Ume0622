import React, {Component} from 'react';
import {
    View, StyleSheet, Text, TouchableOpacity, Dimensions, PixelRatio, FlatList,
    Image,
    Platform,
    Keyboard,
    BackHandler, TextInput, SafeAreaView, DeviceEventEmitter,
} from 'react-native';
import config from '../service/config';

import Global from '../util/Global';
import Utils from '../util/Utils';
import TimeUtils from '../util/TimeUtil';
import MoreView from '../views/MoreView';
import UserInfoUtil from '../util/MessageUserInfoUtil';
import ImageAdapter from '../views/ImageAdapter';
import Config from '../service/config';
import CommonTitleBar from '../views/CommonTitleBar';
import StorageUtil from '../util/StorageUtil';
import Toast from '@ant-design/react-native/es/toast';
import AntmModal from '@ant-design/react-native/lib/modal/Modal';
import {Provider} from '@ant-design/react-native';
import FastImage from 'react-native-fast-image';
import {KeyboardTrackingView} from 'react-native-keyboard-tracking-view';
import {Icon} from 'react-native-elements';
import IMDB from '../util/IMDB';
import moment from 'moment';
import LogUtil from '../util/LogUtil';

let {width} = Dimensions.get('window');

const MSG_LINE_MAX_COUNT = 15;

class Index extends Component {
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
            disturbTag: false,
        };
        this.from_client_id = this.props.navigation.state.params.from_client_id;
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

        this.getDisturb(this.chatType, this.chatContactId, Global.client_name);
    }

    setDisturb(disturb_type, from_id, to_id, action) {
        // this.setState({
        //     showProgress: true,
        // });
        if (disturb_type === 'singleTalk') {
            const getDisturbData = `{"type":"setDisturb","from_id":"${from_id}","to_id":"${to_id}","disturb_type":"${disturb_type}","action":"${action}"}`;
            DeviceEventEmitter.emit('setDisturb', getDisturbData);
        } else if (disturb_type === 'groupTalk') {
            //文档中 参数为groupId 实际参数为 id

        }
    }

    getDisturb(disturb_type, to_id, from_id) {
        //查看免打扰状态
        const getDisturbData = `{"type":"getDisturb","from_id":"${from_id}","to_id":"${to_id}","disturb_type":"${disturb_type}"}`;
        DeviceEventEmitter.emit('getDisturb', getDisturbData);
    }

    componentDidMount() {
        const that = this;
        StorageUtil.get('vip_level', (error, vip_level) => {
            if (!error && vip_level != null) {
                that.setState({
                    vip_level,
                });
            }
        });

        StorageUtil.get('vip_start_time', (error, vip_start_time) => {
            if (!error && vip_start_time != null) {
                that.setState({
                    vip_start_time,
                });
            }
        });

        StorageUtil.get('sex', (error, sex) => {
            if (!error && sex != null) {
                that.setState({
                    sex,
                });
            }
        });

        StorageUtil.get('check_status', function (error, object) {
            if (object !== null) {
                that.setState({
                    checkStatus: object,
                });
            }
        });
    }

    queryMsgHistoryByFromClientName() {
        IMDB.queryMsgHistoryByFromClientName(this.chatContactId, (messages) => {
            let tags = [];
            let _message = messages.reverse();
            for (let i = 0; i < _message.length; i++) {
                let item = _message[i];
                let time = TimeUtils.formatWebSocketMessageTime(item['time']);
                if (tags.indexOf(time) === -1) {
                    tags.push(time);
                    item['isShowTime'] = true;
                }
            }
            this.setState({
                messages: messages.reverse(),
            });
        });
    }

    addListener() {
        //im消息
        this.onmessage = DeviceEventEmitter.addListener('onmessage', (data) => {
            this.queryMsgHistoryByFromClientName();
        });
        this.unread = DeviceEventEmitter.addListener('unread', (data) => {
            this.queryMsgHistoryByFromClientName();
        });
        this.getDisturbResultListener = DeviceEventEmitter.addListener('getDisturbResult', (data) => {
            LogUtil.d('获取免打扰状态:', data['result'][0]);
            this.setState({
                disturbTag: data['result'][0] !== '0',
            });
        });
        this.setDisturbResultListener = DeviceEventEmitter.addListener('setDisturbResult', (data) => {
            LogUtil.d('获取免打扰状态', data);
            if (!data['result']) {
                AntmModal.alert('设置免打扰失败', '请检查后再次尝试！', [{text: '知道了'}]);
            } else {
                this.setState({
                    disturbTag: !this.state.disturbTag,
                });
            }
        });
    }

    componentWillMount() {
        this.addListener();
        this.queryMsgHistoryByFromClientName();

        // android需要调用进入会话的api，进入会话后android不会有通知栏消息
        if (Platform.OS === 'android') {
            let options = {
                type: this.chatType,
                appKey: Global.JIMAppKey,
            };
            if (this.chatType === 'chatroom') {
                options.roomId = this.chatContactId;
            } else if (this.chatType === 'group') {
                options.groupId = this.chatContactId;
            } else {
                options.username = this.chatContactId;
            }
            // LogUtil.d("enterConversation: " + JSON.stringify(options));

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
            BackHandler.addEventListener('hardwareBackPress', this.backHandler);
        } else if (Platform.OS === 'ios') {
            if (this.chatType === 'group') {

            }
        }

        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                // 键盘显示，则隐藏底部View
                this.updateView(false, false);
            },
        );
    }

    //倒着分页
    pagination(pageNo, pageSize, array) {
        let offset = (pageNo - 1) * pageSize;
        return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    }

    _detail() {
        if (this.chatType === 'groupTalk') {
            this.props.navigation.navigate('GroupInfo', {'id': this.chatContactId});
        } else if (this.chatType === 'singleTalk') {
            this.props.navigation.navigate('DetailIndex', {id: this.chatContactId});
        }
    }

    disturbBtn() {
        //true已开启免打扰
        if (this.state.disturbTag) {
            return (
                <Icon name={'bell-off-outline'} type={'material-community'}
                      iconStyle={{backgroundColor: 'white'}}
                    // disabled={this.state.showProgress}
                      onPress={() => {
                          AntmModal.alert('提醒', '是否要关闭免打扰?', [{
                              text: '关闭', onPress: () => {
                                  this.setDisturb(this.chatType, Global.client_name, this.chatContactId, 'del');
                              },
                          }, {text: '取消'}]);
                      }} size={25}/>
            );
        }
        //关闭免打扰
        else {
            return (
                <Icon name={'bell-ring-outline'} type={'material-community'}
                      iconStyle={{backgroundColor: 'white'}}
                    // disabled={this.state.showProgress}
                      onPress={() => {
                          AntmModal.alert('提醒', '是否要开启免打扰?', [{
                              text: '开启', onPress: () => {
                                  this.setDisturb(this.chatType, Global.client_name, this.chatContactId, 'add');
                              },
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
                            backgroundColor: Global.dividerColor,
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
                </View>,
            );
        }
        if (this.state.showMoreView) {
            moreView.push(
                <View>
                    <View
                        style={{
                            width: width,
                            height: 1 / PixelRatio.get(),
                            backgroundColor: Global.dividerColor,
                        }}
                    />
                    <View style={{height: Global.addViewHeight}}>
                        <MoreView sendImageMessage={this.sendImageMessage.bind(this)}/>
                    </View>
                </View>,
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
                                        justifyContent: 'center',
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
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{
                                            color: '#ffffff',
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
            AntmModal.alert('提醒', '您的资料将在24小时内审核完毕', [{text: '知道了'}]);
        } else if (this.state.checkStatus === 2) {
            AntmModal.alert('提醒', '很遗憾，您的资料未通过审核', [{text: '取消'}, {
                text: '前往修改', onPress: () => this.props.navigation.navigate('EditWdIndex'),
            }]);
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
            this.setState({inputMsg: ''});
            this.sendTextMessage(msg);
        } else if (config.state === '1' && config.sex === '1') {
            this.setState({inputMsg: ''});
            this.sendTextMessage(msg);
        }
    };


    sendTextMessage(message) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        /**
         *此处 发送人昵称 故意逆转  ,具体原因查看 app.js中接收sendMessage 的listener
         **/
        let data = `{"type":"${this.chatType}","from_client_id":"${Global.client_id}","from_client_name":"${Global.client_name}","from_client_nickname":"${this.chatUsernick}","to_client_id":"${this.from_client_id}","to_client_name":"${this.chatContactId}","content":"${message}","time":"${time}"}`;
        // let data = `{"type":"${this.chatType}","to_client_id":"${this.from_client_id}","to_client_name":"${this.chatContactId}","content":"${message}"}`;
        DeviceEventEmitter.emit('sendMessage', data);
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

    }

    updateView = (emoji, more) => {
        this.setState(
            {
                showEmojiView: emoji,
                showMoreView: more,
            },
            () => {
                if (emoji || more) {
                    Keyboard.dismiss();
                }
            },
        );
    };

    _keyExtractor = (item, index) => 'list-item-' + index;

    shouldShowTime(item, index) {
        // 该方法判断当前消息是否需要显示时间
        if (this.chatType === 'group' && index === 2) {
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
        return item['type'] === 'singleTalkByMe';
    }

    renderItem = ({item, index, separators}) => {
        let msgType = item['msg_type'];
        if (msgType === 'text') {
            // 文本消息
            if (!this.isMyMsg(item)) {
                return this.renderReceivedTextMsg(item, index);
            } else {
                return this.renderSendTextMsg(item, index);
            }
        } else if (msgType === 'image') {
            // 图片消息
            if (!this.isMyMsg(item)) {
                return this.renderReceivedImgMsg(item);
            } else {
                return this.renderSendImgMsg(item);
            }
        }
    };

    // 渲染接收的文本消息
    renderReceivedTextMsg(item, index) {
        let contactAvatar = require('../images/benutzer.png');
        if (this.chatType === 'group') {
            // 群聊的头像为某个人的头像
            contactAvatar = config.host + '/api/v1/img/' + item['from_client_name'];
        } else {
            // 单聊的头像
            if (!Utils.isEmpty(this.chatWithAvatar)) {
                contactAvatar = this.chatWithAvatar;
            }
        }
        return (
            <View style={{flex: 1, width: width, alignItems: 'center'}}>
                {item.isShowTime ? (
                    <Text style={listItemStyle.time}>
                        {TimeUtils.formatWebSocketMessageTime(item['time'])}
                    </Text>
                ) : null}
                <View style={listItemStyle.container}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate('DetailIndex', {id: item['from_client_name']})}>
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
                            {Utils.spliceStr(item['content'], MSG_LINE_MAX_COUNT)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // 渲染发送出去的文本消息
    renderSendTextMsg(item, index) {
        let avatar = Config.host + Config.lifephotos;
        return (
            <View style={{flex: 1, width: width, flexDirection: 'column', alignItems: 'center'}}>
                {item.isShowTime === true ? (
                    <Text style={listItemStyle.time}>
                        {TimeUtils.formatWebSocketMessageTime(item['time'])}
                    </Text>
                ) : null}
                <View style={listItemStyle.containerSend}>
                    <View style={listItemStyle.msgContainerSend}>
                        <Text style={listItemStyle.msgText}>
                            {Utils.spliceStr(item['content'], MSG_LINE_MAX_COUNT)}
                        </Text>
                    </View>
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

        if (this.chatType === 'group') {
            // 群聊的头像为某个人的头像
            contactAvatar = config.host + '/api/v1/img/' + item.from.username.split(config.jMessageAccountHeader)[1];
        } else {
            // 单聊的头像
            if (!Utils.isEmpty(this.chatWithAvatar)) {
                contactAvatar = this.chatWithAvatar;
            }
        }
        return (
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
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
                            {paddingLeft: 0, paddingRight: 0},
                        ]}
                    >
                        <Image
                            source={{uri: 'file://' + item.thumbPath}}
                            style={{
                                width: 150,
                                height: 150,
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
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
                {this.shouldShowTime(item) ? (
                    <Text style={listItemStyle.time}>
                        {TimeUtils.formatChatTime(parseInt(item.createTime / 1000))}
                    </Text>
                ) : null}
                <View style={listItemStyle.containerSend}>
                    <View
                        style={[
                            listItemStyle.msgContainerSend,
                            {paddingLeft: 0, paddingRight: 0},
                        ]}
                    >
                        <Image
                            source={{uri: 'file://' + item.thumbPath}}
                            style={{
                                borderRadius: 3,
                                width: 150,
                                height: 150,
                            }}
                        />
                    </View>
                    <ImageAdapter width={40} height={40} path={avatar}/>
                    {/* <Image style={listItemStyle.avatar} source={avatar} /> */}
                </View>
            </View>
        );
    }

    unregisterListeners() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
        }
        this.onmessage.remove();
        this.unread.remove();
        this.keyboardDidShowListener.remove();
        this.getDisturbResultListener.remove();
        this.setDisturbResultListener.remove();
    }

    componentWillUnmount() {
        this.unregisterListeners();
        Global.currentChattingUsername = null;
        Global.currentChattingType = null;

    }

}

const
    listItemStyle = StyleSheet.create({
        container: {
            flex: 1,
            width: width,
            flexDirection: 'row',
            padding: 5,
        },
        avatar: {
            width: 40,
            height: 40,
        },
        msgContainer: {
            backgroundColor: '#FFFFFF',
            borderRadius: 3,
            paddingLeft: 8,
            paddingRight: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 5,
        },
        msgContainerSend: {
            // backgroundColor: GlobalStyles.bgColor,
            backgroundColor: '#9FE658',
            borderRadius: 3,
            paddingLeft: 8,
            paddingRight: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 5,
        },
        msgText: {
            fontSize: 15,
            lineHeight: 24,
            maxWidth: width - 120,
        },
        containerSend: {
            flex: 1,
            width: width,
            flexDirection: 'row',
            padding: 5,
            justifyContent: 'flex-end',
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
            fontSize: 11,
        },
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
            backgroundColor: Global.pageBackgroundColor,
        },
        bottomBar: {
            // minHeight: 50,
            // height: 50,
            maxHeight: 160,
            flexDirection: 'row',
            alignItems: 'center',
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
            backgroundColor: Global.dividerColor,
        },
        trackingView: {
            ...Platform.select({
                ios: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
            }),
        },
    });

export default Index;
