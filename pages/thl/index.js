import React, {Component} from 'react';
import {
    AsyncStorage,
    TouchableOpacity,
    Image,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    View,
    Dimensions,
    Text,
    Linking,
    PixelRatio,
    Platform,
    Modal as RNModel,
    Animated,
    FlatList, StatusBar,
    SafeAreaView
} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';
import api from '../service/allMembersApi';
import utilsApi from '../service/utilsApi';
import systemInfoApi from '../service/SystemInfoApi';
import config from '../service/config';
import userInfoUtil from '../util/userInfoUtil';
import {RecyclerListView, LayoutProvider, DataProvider} from 'recyclerlistview';
import {Toast, Modal, Provider} from '@ant-design/react-native';
import TitleBar from '../views/TitleBar';
import {withNavigationFocus} from 'react-navigation';
import UserInfoApi from '../service/UserInfoApi';
import Global from '../util/Global';
import FastImage from 'react-native-fast-image';
import JMessage from 'jmessage-react-plugin';
import StorageUtil from '../util/StorageUtil';
import DBHelper from '../util/DBHelper';
import MessageUserInfoUtil from '../util/MessageUserInfoUtil';
import jMessage from '../service/jMessage';
import VipLevelView from '../views/VipLevelView';
import HeaderView from './HeaderView';
import Utils from '../util/Utils';
import AntmModal from '@ant-design/react-native/lib/modal/Modal';

let {width} = Dimensions.get('window');

const url = config.host;

const text = {
    marginRight: 8,
    fontSize: 14,
    color: '#969696',
};
const name = {
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
};

const ViewTypes = {
    FULL: 0,
};
const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#03A9F4',
        overflow: 'hidden',
        height: HEADER_MAX_HEIGHT,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: null,
        height: HEADER_MAX_HEIGHT,
        resizeMode: 'cover',
    },
    bar: {
        backgroundColor: 'transparent',
        marginTop: Platform.OS === 'ios' ? 28 : 38,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    title: {
        color: 'white',
        fontSize: 18,
    },
    scrollViewContent: {
        // iOS uses content inset, which acts like padding.
        paddingTop: Platform.OS !== 'ios' ? HEADER_MAX_HEIGHT : 0,
    },
    divider: {
        marginTop: 5,
        flex: 1,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor,
    },
    contentFindView: {
        flex: 1,
        position: 'absolute',
        bottom: 5,
        right: '2%',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
    },
    container: {
        // width: width,//使用recyclelistview自动高度的时候
        flex: 1,
        backgroundColor: '#fff',
        borderColor: '#dddddd',
        marginLeft: '5%',
        marginRight: '5%',
        marginBottom: 5,
    },
    topicLeft: {
        width: width - 210,
        marginRight: 10,
    },
    topicRight: {
        backgroundColor: '#f5f5f5',
        width: 140,
        height: 140,
        padding: 15,
    },
    topicTitle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 28,
    },
    topicContext: {
        color: '#999',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 10,
    },
    topicNum: {
        fontSize: 14,
        marginTop: 20,
    },
    topicRightText: {
        fontSize: 14,
        color: '#666',
    },
});

let downloadUrl = {
    ...Platform.select({
        android: {
            url: 'https://play.google.com/store/apps/details?id=orz.qianyuan',
        },
        ios: {
            url:
                'itms-apps://ax.itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?mt=8&onlyLatestVersion=true&pageNumber=0&sortOrdering=1&type=Purple+Software&id=1489277012',
        },
    }),
};

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

class Index extends Component {
    constructor(props) {
        super(props);

        this.dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });
        let {width} = Dimensions.get('window');
        this._layoutProvider = new LayoutProvider(
            (index) => {
                return ViewTypes.FULL;
            },
            (type, dim) => {
                dim.width = width;
                dim.height = 378;
            },
        );
        this.state = {
            headerData: '',
            infoList: [],
            loading: false,
            isLoadMore: false,
            loadMoreText: '',
            filterViewStatus: false,
            filter: '筛选',
            filterColor: '#EE6A50',
            reportViewStatus: false,
            reportID: -1,
            guide: false,
            scrollY: new Animated.Value(
                // iOS has negative initial scroll value because content inset...
                Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
            ),
        };

        const that = this;
        StorageUtil.getWithOutJSONParse('access_token', function (error, object) {
            if (object !== null) {
                config.access_token = object;
                if (config.access_token === 'none') {
                    that.setState({
                        guide: true,
                    });
                }
            }
        });
    }

    getMembers = () => {
        this.page = 1;
        const that = this;

        api
            .getMembersList(this.page, this.filter)
            .then(
                function (message) {
                    const _list = message.data.data;

                    let isLoadMore = false;
                    if (_list.length === 10) {
                        isLoadMore = true;
                    }

                    if (message.ad !== undefined) {
                        // _list.unshift(message.ad);
                        _list.push(message.ad);
                    }
                    if (!Utils.isEmpty(message.headerdata)) {
                        that.setState({
                            headerData: message.headerdata,
                        });
                    }

                    const _loadMoreText =
                        isLoadMore === true ? '正在加载更多...' : '没有了';
                    that.setState({
                        loadMoreText: _loadMoreText,
                        isLoadMore,
                        infoList: _list,
                        loading: false,
                    });
                },
                function (error) {
                    that.setState({
                        loading: false,
                    });
                    Toast.info('网络错误！请检查后再次尝试！');
                },
            )
            .done();
    };

    // _rowRenderer = (type, item) => {
    _rowRenderer = ({item, index, separators}) => {
        if (item.type !== undefined) {
            let lifephotos = JSON.parse(item.photo);
            return (
                <View style={styles.container}>
                    <TouchableOpacity
                        onPress={this._activitiesADView.bind(
                            this,
                            item.type,
                            item.url,
                            item.id,
                        )}>
                        <View style={{backgroundColor: '#FFFFFF'}}>
                            <View>
                                {lifephotos.length > 0 ? (
                                    <FastImage
                                        source={{
                                            uri: url + lifephotos[0],
                                            priority: FastImage.priority.normal,
                                        }}
                                        style={{
                                            width: '100%',
                                            height: 300,
                                            marginTop: 5,
                                        }}
                                    />
                                ) : (
                                    <FastImage
                                        style={{width: '100%', height: 300, marginTop: 5}}
                                    />
                                )}
                            </View>
                            <View
                                style={{
                                    marginTop: 10,
                                    height: 30,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                <Text style={name}>{item.title}</Text>
                                {/* <Icon
                    name='dots-vertical'
                    type='material-community'
                    size={20}
                  /> */}
                            </View>
                            <View
                                style={{
                                    marginTop: 8,
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                }}>
                                <View>
                                    <Text style={text}>
                                        {item.type === 0 ? '官方活动' : '这是一条广告'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}/>
                </View>
            );
        } else {
            let isMale = item.sex;
            let lifephotos = JSON.parse(item.lifephoto);
            let birthdateStr = '';
            if (item.birthdate != null) {
                birthdateStr = item.birthdate.split('-')[0] + '年 ';
            }
            return (
                <View style={styles.container}>
                    <TouchableOpacity onPress={this.gotoDetail.bind(this, item.id)}>
                        <View style={{backgroundColor: '#FFFFFF'}}>
                            <View>
                                {lifephotos.length > 0 ? (
                                    <FastImage
                                        source={{
                                            uri: url + lifephotos[0],
                                            priority: FastImage.priority.normal,
                                        }}
                                        style={{
                                            width: '100%',
                                            height: 300,
                                            marginTop: 5,
                                        }}
                                    />
                                ) : (
                                    <FastImage
                                        style={{width: '100%', height: 300, marginTop: 5}}
                                    />
                                )}
                            </View>

                            <View
                                style={{
                                    marginTop: 10,
                                    height: 30,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                <View
                                    style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={name}>{item.name}</Text>
                                    <VipLevelView
                                        vipLevel={item.vip_level}
                                        style={{width: 40, height: 40, marginLeft: 5}}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({reportViewStatus: true, reportID: item.id});
                                    }}>
                                    <Icon
                                        name="dots-vertical"
                                        type="material-community"
                                        size={20}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={{
                                    marginTop: 5,
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                }}>
                                {isMale === 0 ? (
                                    <Icon
                                        name="gender-male"
                                        type="material-community"
                                        color="#6495ED"
                                        size={15}
                                    />
                                ) : (
                                    <Icon
                                        name="gender-female"
                                        type="material-community"
                                        color="#EE6A50"
                                        size={15}
                                    />
                                )}

                                <View>
                                    <Text style={text}>{item.live}</Text>
                                </View>
                                <View>
                                    <Text style={text}>
                                        {birthdateStr}
                                        {item.starsign}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={text}>{item.education}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}/>
                </View>
            );
        }
    };

    _renderFooter = () => {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    // backgroundColor: 'white',
                    marginBottom: 5,
                }}>
                {this.state.isLoadMore === true ? (
                    <ActivityIndicator size="small" color="#63B8FF"/>
                ) : null}
                <View style={{alignItems: 'center'}}>
                    <Text>{this.state.loadMoreText}</Text>
                </View>
            </View>
        );
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this.getMoreMembers();
    };

    getMoreMembers = () => {
        this.page = this.page + 1;
        const that = this;
        // Toast.info('正在加载更多...', 1, undefined, false);
        api.getMembersList(this.page, this.filter).then(
                function (message) {
                    let isLoadMore = false;
                    let _list = message.data.data;
                    if (_list.length === 10) {
                        isLoadMore = true;
                    }

                    if (message.ad !== undefined) {
                        // _list.unshift(message.ad);
                        _list.push(message.ad);
                    }

                    that.setState({
                        loadMoreText:
                            isLoadMore === true ? that.state.loadMoreText : '没有了',
                        isLoadMore,
                        infoList: that.state.infoList.concat(_list),
                    });
                    if (!isLoadMore) {
                        Toast.info('没有了', 1, undefined, false);
                    } else {
                        // Toast.info('正在加载更多...', 1, undefined, false);
                    }
                },
                function (error) {
                    that.setState({
                        isLoadMore: true,
                    });
                    Toast.info('网络错误！请检查后再次尝试！');
                },
            ).done();
    };

    UNSAFE_componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        UserInfoApi.getUserInfo();
        return true;
    }

    componentDidMount() {
        if (this.state.infoList.length === 0) {
            this.setState({
                loading: true,
            });
            this.filter = 2;
        }

        this._init().then((r) => {
        });
    }

    async _init() {
        await userInfoUtil.initUserInfo();
        this.getMembers();
        let that = this;

        systemInfoApi
            .getSysInfo()
            .then(
                function (params) {
                    /**
                     * 登录后的操作
                     */
                    if (config.access_token !== 'none') {
                        if (params.version.j_register_status === 0) {
                            let uid = params.version.uid;
                            let jUserName = config.jMessageAccountHeader + uid;
                            that.registerToJIM(jUserName, jUserName);
                        }
                        //如果用户创建成功检测是否加入了群
                        else {
                            that.getGroupIds();
                        }

                        if (config.state !== '1') {
                            that.personalInfo(
                                '未完成资料功能将受到限制',
                                '是否前往完善个人资料',
                            );
                        } else if (params.version.check_status === 2) {
                            that.personalInfo('您的资料未通过审核', '是否前往修改');
                        }
                    }
                    /**
                     * 结束
                     */

                    let ios_version = params.version.ios_version;
                    let android_version = params.version.android_version;
                    if (
                        Platform.OS === 'android' &&
                        Global.AndroidVersion < android_version
                    ) {
                        that.getNewVersion();
                    } else if (Platform.OS === 'ios' && Global.IosVersion < ios_version) {
                        that.getNewVersion();
                    }
                },
                function (error) {
                },
            )
            .done();
    }

    registerToJIM(username, password) {
        JMessage.register(
            {
                username: username,
                password: password,
            },
            () => {
                // Toast.showShortCenter("注册成功");
                StorageUtil.set('username', {username: username});
                // 关闭当前页面
                // this.props.navigation.goBack();
                // 跳转到登录界面
                // this.props.navigation.navigate("Login");
                this.loginToJIM(username, password);
            },
            (e) => {
                Toast.info('聊天系统注册失败', 1, undefined, false);
                // Toast.showShortCenter("注册失败：" + e);
            },
        );
    }

    // 登录极光IM服务器
    loginToJIM(username, password) {
        // 初始化数据库
        DBHelper.init(username);
        // 获取未读好友消息数
        DBHelper.getUnreadFriendMsgCount((count) => {
            if (count > 0) {
                // TabConfig.TAB_CONTACT_DOT_COUNT = count;
            }
        });
        this.loginUsername = username;
        this.loginPassword = password;
        // 登录极光IM
        JMessage.login(
            {
                username: username,
                password: password,
            },
            () => {
                //加西班牙群
                this.getGroupIds();
                // 登录IM服务器成功
                this.getCurrentUserInfo();
                this.jMessageUpdateMyInfo(config.name);
            },
            (e) => {
                // Toast.showShortCenter("登录IM失败：" + e.description);
                Toast.info('登录聊天系统失败', 1, undefined, false);
            },
        );
    }

    jMessageUpdateMyInfo(nickname) {
        JMessage.updateMyInfo(
            {nickname: nickname},
            () => {
                // do something.
            },
            (error) => {
            },
        );
    }

    getGroupIds() {
        JMessage.getGroupIds(
            (result) => {
                /**
                 * result {Array[Number]} 当前用户所加入的群组的groupID的list
                 */
                let description = '';

                for (let i in result) {
                    description += i + '= ' + result[i] + ';';
                }

                console.log('qianyuan', 'result=======' + description);
                //比对服务端群组数量，添加成员进群
                if (result.length > 0) {
                } else {
                    jMessage
                        .addMembers()
                        .then(
                            function (params) {
                                console.log('qianyuan', params);
                            },
                            function (error) {
                                let description = '';

                                for (let i in error) {
                                    description += i + '= ' + error[i] + ';';
                                }
                                console.log('qianyuan', 'joingroup=======' + description);
                            },
                        )
                        .done();
                }
            },
            (error) => {
                if (error.code === 863004) {
                    userInfoUtil.logout();
                    AntmModal.alert('提醒', '当前未登录,您是否已在其他设备登录过?', [
                        {
                            text: '知道了',
                        },
                    ]);
                } else {
                    let description = '';

                    for (let i in error) {
                        description += i + '= ' + error[i] + ';';
                    }

                    console.log('qianyuan', 'error=======' + description);
                }
                /**
                 * error {Object} {code:Number,desc:String}
                 */
            },
        );
    }

    getCurrentUserInfo() {
        // JMessage.getMyInfo(info => {
        //     if (info.username === undefined) {
        //         // 未登录
        //     } else {
        //         // 已登录
        //         MessageUserInfoUtil.userInfo = info;
        //     }
        //     // LogUtil.d("getMyInfo: " + JSON.stringify(info));
        // });
        JMessage.getUserInfo(
            {username: this.loginUsername, appKey: Global.JIMAppKey},
            (info) => {
                // LogUtil.d("getUserInfo: " + JSON.stringify(info));
                MessageUserInfoUtil.userInfo = info;
                StorageUtil.set('hasLogin', {hasLogin: true});
                StorageUtil.set('username', {username: this.loginUsername});
                StorageUtil.set('password', {password: this.loginPassword});
                // const resetAction = StackActions.reset({
                //   index: 0,
                //   actions: [NavigationActions.navigate({ routeName: "Home" })]
                // });
                // this.props.navigation.dispatch(resetAction);
                this.postJMessageStatus().then((r) => {
                });
            },
            (error) => {
                // LogUtil.d("getUserInfo, error = " + error);
            },
        );
    }

    //更新即时通讯注册状态
    postJMessageStatus() {
        let url = config.host + '/api/v1/pjs';
        let obj = {status: 1};
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
                Authorization: config.access_token,
            },
            body: JSON.stringify(obj),
        })
            .then((response) => {
                return response.json();
            })
            .then((responseJSON) => {
                if (responseJSON.code === 200) {
                    // this.props.navigation.replace('EditWdIndex');
                    // this.setState({
                    //     loading: false
                    // });
                }
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                });
                console.log('error:', error);
                Toast.info('发生错误,请检查后再试', 1, undefined, false);
            });
    }

    personalInfo(title, content) {
        Modal.alert(title, content, [
            {text: '取消'},
            {
                text: '去完善',
                onPress: () => {
                    this.props.navigation.navigate('EditWdIndex');
                },
            },
        ]);
    }

    getNewVersion() {
        Modal.alert('有新版本', '是否前往更新', [
            {
                text: '取消',
            },
            {
                text: '更新',
                onPress: () => {
                    // android 会打开默认浏览器，然后进入该地址
                    Linking.openURL(downloadUrl.url).catch((err) => {
                        // 出错时执行
                        // ...
                    });
                },
            },
        ]);
    }

    gotoDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {id});
    };

    _activitiesADView = (type, url, id) => {
        this.props.navigation.navigate('ActivitiesAD', {type, url, id});
    };

    /**
     * 空布局
     */
    _createEmptyView() {
        return (
            <View
                style={{
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <Text style={{fontSize: 16}}>暂无列表数据，下拉刷新</Text>
            </View>
        );
    }

    _separator() {
        return <View style={{height: 10}}/>;
    }

    keyExtractor = (item, index) => index.toString();

    _setFilter(filter, filterColor) {
        this.setState({
            infoList: [],
            loading: true,
            isLoadMore: false,
            loadMoreText: '',
            filterViewStatus: false,
            filter,
            filterColor,
        });
        this.getMembers();
    }

    _keyExtractor = (item, index) => 'list-item-' + index;

    _refresh() {
        this.setState({loading: true});
        this.getMembers();
    }

    render() {
        // Because of content inset the scroll value will be negative on iOS so bring
        // it back to 0.

        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider style={{flex: 1, backgroundColor: '#ffffff'}}>
                    {this.state.guide ?
                        <RNModel
                            transparent={true}
                        >
                            <View style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)'
                            }}>
                                <View
                                    style={{
                                        borderRadius: 15, borderWidth: 3, borderColor: 'pink',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <View style={{
                                        // borderRadius: 10,
                                        // borderWidth: 1,
                                        // borderColor: 'pink',
                                        margin: 10,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Text style={{
                                            textAlign: 'center',
                                            textAlignVertical: 'center',
                                            color: "pink",
                                            fontSize: 16,
                                        }}>请先注册或登录</Text>
                                        <Text style={{
                                            textAlign: 'center',
                                            textAlignVertical: 'center',
                                            color: "pink",
                                            fontSize: 16,
                                            marginTop: 5
                                        }}>然后完善您的个人资料</Text>
                                        <Text style={{
                                            textAlign: 'center',
                                            textAlignVertical: 'center',
                                            color: "pink",
                                            fontSize: 16,
                                            marginTop: 5
                                        }}>注定的另一半将更容易找到您</Text>
                                    </View>
                                    <TouchableOpacity activeOpacity={0.6} onPress={() => {
                                        this.setState({
                                            guide: false
                                        });
                                        this.props.navigation.navigate('LoginRegister');
                                    }}>
                                        <View
                                            style={{
                                                borderRadius: 15,
                                                borderWidth: 1,
                                                borderColor: 'pink',
                                                margin: 10,
                                                height: 30,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {/*<Image style={{width: width - 150, height: 30, marginTop: 5}}*/}
                                            {/*       source={requ
                                            ire("../images/star.png")}/>*/}
                                            <Text style={{
                                                textAlign: 'center',
                                                textAlignVertical: 'center',
                                                color: "pink",
                                                fontSize: 16,
                                            }}>去注册</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.6} onPress={() => {
                                        this.setState({
                                            guide: false
                                        });
                                        this.props.navigation.navigate('LoginIndex');
                                    }}>
                                        <View
                                            style={{
                                                borderRadius: 15,
                                                borderWidth: 1,
                                                borderColor: 'pink',
                                                margin: 10,
                                                height: 30,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {/*<Image style={{width: width - 150, height: 30, marginTop: 5}}*/}
                                            {/*       source={require("../images/star.png")}/>*/}
                                            <Text style={{
                                                textAlign: 'center',
                                                textAlignVertical: 'center',
                                                color: "pink",
                                                fontSize: 16,
                                            }}>去登录</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.6} onPress={() => {
                                        this.setState({
                                            guide: false
                                        })
                                    }}>
                                        <View
                                            style={{
                                                borderRadius: 15,
                                                borderWidth: 1,
                                                borderColor: 'pink',
                                                margin: 10,
                                                height: 30,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {/*<Image style={{width: width - 150, height: 30, marginTop: 5}}*/}
                                            {/*       source={require("../images/star.png")}/>*/}
                                            <Text style={{
                                                textAlign: 'center',
                                                textAlignVertical: 'center',
                                                color: "pink",
                                                fontSize: 16,
                                            }}>取消</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </RNModel> : null}
                    <View style={{flex: 1}}>
                        <TitleBar title={'U&ME'} nav={this.props.navigation} isfilter={true} filter={index => {
                            switch (index) {
                                case 0:
                                    this.filter = 2;
                                    break;
                                case 1:
                                    this.filter = 1;
                                    break;
                                case 2:
                                    this.filter = 0;
                                    break;
                                default:
                                    break;
                            }
                            this.setState({
                                infoList: [],
                                loading: true,
                                isLoadMore: false,
                                loadMoreText: '',
                                filterViewStatus: false,
                            });
                            this.getMembers();
                        }}/>
                        <FlatList
                            ListHeaderComponent={<HeaderView nav={this.props.navigation}
                                                             data={this.state.headerData}/>}
                            style={[styles.fill]}
                            data={this.state.infoList}
                            renderItem={this._rowRenderer}
                            keyExtractor={this._keyExtractor}
                            extraData={this.state}
                            onEndReached={this._onLoadMore}
                            onEndReachedThreshold={1}
                            ListFooterComponent={this._renderFooter}
                            refreshing={this.state.loading}
                            onRefresh={() => {
                                this._refresh();
                            }}
                        />
                        <Modal
                            popup
                            onClose={() => this.setState({reportViewStatus: false})}
                            maskClosable={true}
                            visible={this.state.reportViewStatus}
                            animationType="slide-up"
                        >
                            <ListItem
                                title={'不感兴趣'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 1,
                                        report_id: this.state.reportID,
                                        data: '不感兴趣'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'色情低俗'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 1,
                                        report_id: this.state.reportID,
                                        data: '色情低俗'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'政治敏感'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 1,
                                        report_id: this.state.reportID,
                                        data: '政治敏感'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'广告'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 1,
                                        report_id: this.state.reportID,
                                        data: '广告'
                                    }));
                                }}
                            />

                            <ListItem
                                title={'令人恶心'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 1,
                                        report_id: this.state.reportID,
                                        data: '令人恶心'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'违纪违法'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 1,
                                        report_id: this.state.reportID,
                                        data: '违纪违法'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'其他'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 1,
                                        report_id: this.state.reportID,
                                        data: '其他'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'取消'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.setState({
                                        reportViewStatus: false
                                    })
                                }}
                            />
                        </Modal>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }

    _postReport(params) {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else {
            let that = this;
            utilsApi
                .postReport(params)
                .then(
                    function (params) {
                        Toast.info('举报成功', 1, undefined, false);
                        that.setState({
                            reportViewStatus: false,
                        });
                    },
                    function (error) {
                        that.setState({
                            reportViewStatus: false,
                        });
                    },
                )
                .done();
        }
    }
}

export default withNavigationFocus(Index);
