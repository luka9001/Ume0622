import React, {Component} from 'react';
import {View, ScrollView, AsyncStorage, Image, SafeAreaView, DeviceEventEmitter} from 'react-native';
import {Icon, ListItem, Button} from 'react-native-elements';
import {Modal, Toast, Provider} from '@ant-design/react-native';
import serverConfig from '../service/config';
import cache from '../util/cache';
import userInfoUtil from '../util/userInfoUtil';
import DBHelper from "../util/DBHelper";
import StorageUtil from "../util/StorageUtil";
import TitleBar from '../views/TitleBar';
import {withNavigationFocus} from 'react-navigation';
import LoadingView from "../views/LoadingView";
import UserInfoApi from "../service/UserInfoApi";
import Global from "../util/Global";
import FastImage from 'react-native-fast-image'
import CountEmitter from "../event/CountEmitter";
import IMDB from '../util/IMDB';

const url = serverConfig.host;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            access_token: 'none',
            refresh_token: 'none',
            lifephoto: '',
            name: '',
            loading: false,
            logoutViewStatue: false,
            vip_level: 0,
            vip_start_time: 0,
            coin: 0,
            sex: ''
        };
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.isFocused) {
            UserInfoApi.getUserInfo();
            this.componentDidMount();
            return true;
        } else {
            return false;
        }
    }

    componentDidMount() {
        this._init();
        // if (Platform.OS === 'android') {
        StorageUtil.get("vip_level", (error, vip_level) => {
            if (!error && vip_level != null) {
                this.setState({
                    vip_level
                });
            }
        });
        // }
        // else if (Platform.OS === 'ios') {
        //   this.getAvailablePurchases();
        // }

        StorageUtil.get("vip_start_time", (error, vip_start_time) => {
            if (!error && vip_start_time != null) {
                this.setState({
                    vip_start_time
                });
            }
        });

        StorageUtil.get("coin", (error, coin) => {
            if (!error && coin != null) {
                this.setState({
                    coin
                });
            }
        });

        StorageUtil.get("sex", (error, sex) => {
            if (!error && sex != null) {
                this.setState({
                    sex
                });
            }
        });
    }

    getAvailablePurchases = async (): void => {
        try {
            console.info(
                'Get available purchases (non-consumable or unconsumed consumable)',
            );
            const purchases = await RNIap.getAvailablePurchases();

            console.log('Available purchases', purchases.length);

            if (purchases && purchases.length > 0) {
                this.setState({
                    vip_level: 1
                });
            } else {
                this.setState({
                    vip_level: 0
                });
            }
        } catch (err) {
            console.warn(err.code, err.message);
            // Alert.alert(err.message + '，请退出该页面再次进入');
            this.getAvailablePurchases();
        }
    };

    _init() {
        userInfoUtil.initUserInfo();
        this.setState({
            visible: false,
            access_token: serverConfig.access_token,
            lifephoto: url + serverConfig.lifephotos,
            name: serverConfig.name,
            loading: false
        });
    }

    price = () => {
        if (this.state.access_token === 'none') {
            Modal.alert('当前未登录', '是否前往登录？', [
                {text: '取消', onPress: () => console.log('cancel'), style: 'cancel'},
                {text: '前往登录', onPress: () => this.props.navigation.navigate('LoginIndex')},
            ]);
        } else if (serverConfig.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.props.navigation.navigate('Price');
        }
    };

    grdt = () => {
        if (this.state.access_token === 'none') {
            Modal.alert('当前未登录', '是否前往登录？', [
                {text: '取消', onPress: () => console.log('cancel'), style: 'cancel'},
                {text: '前往登录', onPress: () => this.props.navigation.navigate('LoginIndex')},
            ]);
        } else if (serverConfig.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.props.navigation.navigate('GrdtIndex', {id: 0});
        }
    };

    kf = () => {
        if (this.state.access_token === 'none') {
            Modal.alert('当前未登录', '是否前往登录？', [
                {text: '取消', onPress: () => console.log('cancel'), style: 'cancel'},
                {text: '前往登录', onPress: () => this.props.navigation.navigate('LoginIndex')},
            ]);
        } else if (serverConfig.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.props.navigation.navigate("Chatting", {
                contactId: 'qy_1',
                name: '客服',
                avatar: null,
                type: 'single'
            });
        }
    };

    edit = () => {
        this.props.navigation.navigate('EditWdIndex');
    };

    CoinView = () => {
        if (this.state.access_token === 'none') {
            Modal.alert('当前未登录', '是否前往登录？', [
                {text: '取消', onPress: () => console.log('cancel'), style: 'cancel'},
                {text: '前往登录', onPress: () => this.props.navigation.navigate('LoginIndex')},
            ]);
        } else if (serverConfig.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.props.navigation.navigate('EditWdYhq');
        }
    };

    // set = () => {
    //   this.props.navigation.navigate('pages/set/index');
    // };

    logout = () => {
        this.cleanUserInfo();
        this.setState({
            access_token: 'none',
            refresh_token: 'none',
            lifephoto: '',
            name: '',
            logoutViewStatue: false,
            sex: -1,
            vip_level: 0
        });
        //刷新聊天界面
        DeviceEventEmitter.emit('logout');
        Toast.info('注销成功', 1, undefined, false);
    };

    async cleanUserInfo() {
        serverConfig.access_token = 'none';
        serverConfig.refresh_token = 'none';
        serverConfig.lifephotos = '';
        serverConfig.name = '';
        serverConfig.state = '';
        serverConfig.sex = '';
        cache.language = [];
        cache.nlanguage = [];
        await AsyncStorage.setItem('access_token', 'none');
        await AsyncStorage.setItem('refresh_token', 'none');
        await AsyncStorage.setItem('name', '');
        await AsyncStorage.setItem('lifephotos', '');
        await AsyncStorage.setItem('state', '');
        await AsyncStorage.setItem('sex', '');
        StorageUtil.set("vip_level", 0);
    }

    vipView(sex, vip_level) {
        if (sex === 0 && vip_level === 0) {
            return <ListItem
                // leftIcon={<Icon
                //   name='diamond-stone'
                //   type='material-community'
                //   color='pink'
                //   size={20}
                //   iconStyle={image}
                // />}
                leftElement={<Image style={{width: 20, height: 20}} source={require("../images/vip.png")}/>}
                title={'成为会员'}
                bottomDivider={true}
                onPress={this.price}
            />;
        } else if (vip_level !== 0 && sex === 0) {
            return <ListItem
                // leftIcon={<Icon
                //   name='diamond-stone'
                //   type='material-community'
                //   color='pink'
                //   size={20}
                //   iconStyle={image}
                // />}
                leftElement={<Image style={{width: 20, height: 20}} source={require("../images/vip.png")}/>}
                title={'查看会员'}
                bottomDivider={true}
                onPress={this.price}
            />;
        } else {
            return null;
        }
    }

    vipLevelView(level) {
        switch (level) {
            case 1:
                return (
                    <Image style={{width: 40, height: 40, marginLeft: 5}}
                           source={require("../images/vip1.png")}/>
                );
            case 2:
                return (
                    <Image style={{width: 40, height: 40, marginLeft: 5}}
                           source={require("../images/vip2.png")}/>
                );
            case 3:
                return (
                    <Image style={{width: 40, height: 40, marginLeft: 5}}
                           source={require("../images/vip3.png")}/>
                );
            default :
                return null
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: Global.pageBackgroundColor}}>
                        <TitleBar title={'我'} nav={this.props.navigation} isfilter={false}/>
                        <ScrollView>
                            {this.state.visible ? (
                                <LoadingView
                                    cancel={() => this.setState({visible: false})}
                                />
                            ) : null}
                            <Modal
                                popup
                                onClose={() => this.setState({logoutViewStatue: false})}
                                maskClosable={true}
                                visible={this.state.logoutViewStatue}
                                animationType="slide-up"
                            >
                                <ListItem
                                    // leftIcon={<Icon
                                    //   name='logout-variant'
                                    //   type='material-community'
                                    //   color='#63B8FF'
                                    //   size={20}
                                    //   iconStyle={image}
                                    // />}
                                    leftElement={<Image style={{width: 20, height: 20}}
                                                        source={require("../images/logout.png")}/>}
                                    title={'退出登陆'}
                                    bottomDivider={true}
                                    onPress={() => {
                                        this.logout()
                                    }}
                                />

                                <ListItem
                                    // leftIcon={<Icon
                                    //   name='close-circle'
                                    //   type='material-community'
                                    //   color='gray'
                                    //   size={20}
                                    //   iconStyle={image}
                                    // />}
                                    leftElement={<Image style={{width: 20, height: 20}}
                                                        source={require("../images/error.png")}/>}
                                    title={'取消'}
                                    bottomDivider={true}
                                    onPress={() => {
                                        this.setState({
                                            logoutViewStatue: false
                                        })
                                    }}
                                />
                            </Modal>

                            {
                                this.state.access_token !== 'none' ? <ListItem
                                        style={{marginBottom: 10}}
                                        leftElement={
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <FastImage source={{uri: this.state.lifephoto}}
                                                           style={{width: 60, height: 60, borderRadius: 5}}/>
                                                {this.vipLevelView(this.state.vip_level)}
                                                {/*{this.state.vip_level === 0 ? null :*/}
                                                {/*    <Image style={{width: 20, height: 20, marginLeft: 5}}*/}
                                                {/*           source={require("../images/crown.png")}/>}*/}
                                            </View>
                                        }
                                        title={this.state.name}
                                        subtitleStyle={{color: '#FFD700'}}
                                        rightElement={<Button
                                            title="编辑送福利"
                                            type="clear"
                                            onPress={() => {
                                                // this.setState({
                                                //   loading: true
                                                // });
                                                this.edit()
                                            }}
                                            loading={this.state.loading}
                                        />}
                                        rightTitleStyle={{fontSize: 12}}
                                        chevron={true}
                                        onPress={() => {
                                            this.edit()
                                        }}
                                    /> :
                                    <ListItem
                                        style={{marginBottom: 10}}
                                        leftElement={<FastImage style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 5,
                                            backgroundColor: Global.pageBackgroundColor
                                        }}/>}
                                        title={'点击登录'}
                                        rightTitleStyle={{fontSize: 12}}
                                        chevron={true}
                                        onPress={() => {
                                            this.props.navigation.navigate('LoginIndex');
                                        }}
                                        // containerStyle={{marginBottom: 10}}
                                    />
                            }
                            {this.vipView(this.state.sex, this.state.vip_level)}
                            <ListItem
                                // leftIcon={<Icon
                                //   name='wallet-outline'
                                //   type='material-community'
                                //   color='gold'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/coins.png")}/>}
                                title={'我的心动币'}
                                // bottomDivider={true}
                                onPress={this.CoinView}
                            />
                            <ListItem
                                style={{marginTop: 10}}
                                // leftElement={<Icon
                                //     name='camera-iris'
                                //     type='material-community'
                                //     color='#EE6A50'
                                // />}
                                // leftIcon={<Icon
                                //   name='cellphone-text'
                                //   type='material-community'
                                //   color='#EE6A50'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/ins.png")}/>}
                                title={'个人动态'}
                                // bottomDivider={true}
                                onPress={this.grdt}
                            />

                            <ListItem
                                style={{marginTop: 10}}
                                // leftIcon={<Icon
                                //   name='headset'
                                //   type='material-community'
                                //   color='#43CD80'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/customer-service.png")}/>}
                                title={'联系客服'}
                                bottomDivider={true}
                                onPress={() =>
                                    this.kf()
                                }
                            />

                            {/* <ListItem
        leftIcon={<Icon
          name='settings-outline'
          type='material-community'
          color='#EE6A50'
          size={20}
          iconStyle={image}
        />}
        title={'设置'}
        bottomDivider={true}
        onPress={() => console.log()}
      /> */}

                            {/* <ListItem
            // leftIcon={<Icon
            //   name='message-alert-outline'
            //   type='material-community'
            //   color='#9370DB'
            //   size={20}
            //   iconStyle={image}
            // />}
            leftElement={<Image style={{ width: 20, height: 20 }} source={require("../images/info.png")} />}
            title={'便民信息'}
            bottomDivider={true}
            onPress={() => console.log()}
          /> */}

                            <ListItem
                                // leftIcon={<Icon
                                //   name='logout-variant'
                                //   type='material-community'
                                //   color='#63B8FF'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/logout.png")}/>}
                                title={'退出登陆'}
                                // bottomDivider={true}
                                onPress={() => {
                                    if (serverConfig.access_token !== 'none') {
                                        this.setState({
                                            logoutViewStatue: true
                                        })

                                    } else {
                                        Modal.alert('当前未登录', '是否前往登录？', [
                                            {text: '取消', onPress: () => console.log('cancel'), style: 'cancel'},
                                            {text: '前往登录', onPress: () => this.props.navigation.navigate('LoginIndex')},
                                        ]);
                                    }
                                }}
                            />
                        </ScrollView>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

export default withNavigationFocus(Index);
