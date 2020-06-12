import React, {Component} from 'react';
import {Input, Button, ListItem, Text} from 'react-native-elements';
import {
    StyleSheet,
    ScrollView,
    AsyncStorage,
    View,
    TouchableHighlight,
    TextInput,
    Dimensions,
    TouchableOpacity,
    SafeAreaView, DeviceEventEmitter,
} from 'react-native';
import path from '../service/config'
import serverConfig from '../service/config';
import {Toast, Picker, Modal, Provider} from "@ant-design/react-native";
import StorageUtil from "../util/StorageUtil";
import CommonTitleBar from '../views/CommonTitleBar';
import Utils from "../util/Utils";
import LoadingView from "../views/LoadingView";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import LogUtil from '../util/LogUtil';
import IMDB from '../util/IMDB';

const {width} = Dimensions.get('window');

const SelectItem = (props: any) => (
    <TouchableOpacity onPress={props.onPress}>
        <View style={styles.pwdView}>
            <View style={styles.pwdContainer}>
                <Text style={{fontSize: 16}}>{props.children}</Text>
                <Text style={styles.textSelect}>{props.extra}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobile: "",
            mobilePlaceholder: '请输入手机号码',
            password: "",
            loading: false,
            country: ['中国(+86)'],
        };
    }

    goToRegister() {
        this.props.navigation.replace('LoginRegister');
    };

    resetPassword() {
        this.props.navigation.replace('ResetPassword');
    };

    async login() {
        let mobile = this.state.mobile.trim();
        let password = this.state.password.trim();
        if (Utils.isEmpty(this.state.country)) {
            Modal.alert('提醒', '请先选择国家/地区', [
                {text: '确定'},
            ]);
        } else if (mobile === '' || password === '') {
            Modal.alert('提醒', '账号或密码不能为空', [
                {text: '确定'},
            ]);
        } else {
            this.setState({
                loading: true
            });
            // if (this.state.country != '其他(+)') {
            mobile = this.state.country[0].split('(')[1].split(')')[0] + mobile;
            // }
            let response = await this.getLogin(mobile, password);
            // if (Utils.isEmpty(response)) {
            //   Toast.info('登录失败,请联系客服');
            // }
            // else {
            if (response.access_token === undefined) {
                this.setState({
                    loading: false
                });
                if (response.msg !== undefined) {
                    Modal.alert('提醒', response.msg, [
                        {text: '知道了'},
                    ]);
                } else {
                    Toast.info('登录失败！未知错误！');
                }
            } else {
                let access_token = response.token_type + ' ' + response.access_token;
                let refresh_token = response.token_type + ' ' + response.refresh_token;
                this._storeToken(access_token, refresh_token);

                //登陆之后判断是否填写注册资料
                let userInfo = await this._getUserInfo(access_token);

                serverConfig.name = userInfo.name.toString();
                serverConfig.state = userInfo.state.toString();

                await AsyncStorage.setItem('name', userInfo.name.toString());
                await AsyncStorage.setItem('state', userInfo.state.toString());
                // StorageUtil.set('sex', userInfo.sex);
                StorageUtil.set('vip_level', userInfo.vip_level > 0 ? userInfo.vip_level : 0);
                StorageUtil.set('vip_start_time', userInfo.vip_start_time != null ? userInfo.vip_start_time : 0);
                StorageUtil.set('coin', userInfo.coin > 0 ? userInfo.coin : 0);

                this.dbInit({user_info:userInfo,access_token:access_token,refresh_token:refresh_token});

                if (userInfo.state === 0) {
                    this.props.navigation.replace('EditWdIndex');
                } else {
                    serverConfig.sex = userInfo.sex.toString();
                    serverConfig.lifephotos = JSON.parse(userInfo.lifephoto)[0].toString();
                    await AsyncStorage.setItem('lifephotos', userInfo.lifephoto.toString());
                    StorageUtil.set('sex', userInfo.sex);
                    this.props.navigation.goBack();
                }
            }
            // }
            this.setState({
                loading: false
            });
        }
    };

    dbInit(data){
        IMDB.init(data);
    }

    _getUserInfo(access_token) {
        let url = path.host + '/api/v1/getuserinfo';
        return fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": access_token,
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8'
            },
        }).then((response) => response.json()).then((responseJson) => {
            if (responseJson.code === 200) {
                return responseJson.data;
            } else {
                Toast.info('网络错误！请检查后再试');
            }
        }).catch((error) => {
            console.log('error:', error);
        });
    }

    _storeToken = async (access_token, refresh_token) => {
        try {
            await AsyncStorage.setItem('access_token', access_token);
            serverConfig.access_token = access_token;
            await AsyncStorage.setItem('refresh_token', refresh_token);
            serverConfig.refresh_token = refresh_token;
        } catch (error) {
            // Error saving data
            Toast.info('存储失败，请检查相关权限！');
        }
    };

    getLogin(mobile, password) {
        let that = this;
        let url = path.host + '/api/login';
        let obj = {'mobile': mobile, 'password': password};
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(obj)
        }).then((response) => response.json()).then((responseJson) => {
            return responseJson;
        }).catch((error) => {
            that.setState({
                loading: false
            });
            console.log('error:', error);
        });
    }

    //更新即时通讯注册状态
    postJMessageStatus() {
        let url = path.host + '/api/v1/pjs';
        let obj = {'status': 1};
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': serverConfig.access_token
            },
            body: JSON.stringify(obj)
        }).then((response) => {
            return response.json();
        }).then((responseJSON) => {
            // if (responseJSON.code === 200) {
            //
            // }
        }).catch((error) => {
            console.log('error:', error);
            Toast.info('发生错误,请检查后再试', 1, undefined, false);
        });
    }

    onCountryCodeStatusChange = (value) => {
        this.setState({
            country: value.toString(),
        });
        if (value.toString() === '其他(+)') {
            this.setState({mobilePlaceholder: '例如：8615301555555'});
        } else {
            this.setState({mobilePlaceholder: '请输入手机号码'});
        }
    };

    render() {
        return (
            <SafeAreaView forceInset={{vertical: 'never',top: 'always'}} style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        {this.state.loading ? (
                            <LoadingView
                                cancel={() => this.setState({loading: false})}
                            />
                        ) : null}
                        <CommonTitleBar title={'登录'} nav={this.props.navigation}/>
                        <KeyboardAwareScrollView
                            //{...scrollPersistTaps}
                            // style={style}
                            contentContainerStyle={{flex: 1}}
                            // scrollEnabled={scrollEnabled}
                            alwaysBounceVertical={false}
                            keyboardVerticalOffset={128}
                            // extraHeight={keyboardVerticalOffset}
                            behavior='position'
                        >
                            <ScrollView style={{flex: 1, paddingTop: 80}}>
                                <Picker
                                    data={serverConfig.coutryCode}
                                    cols={1}
                                    value={this.state.country}
                                    onChange={this.onCountryCodeStatusChange}
                                    onOk={(v: any) => this.setState({country: v})}
                                >
                                    <SelectItem>国家/地区</SelectItem>
                                </Picker>

                                <View style={styles.pwdView}>
                                    <View style={styles.pwdContainer}>
                                        <Text style={{fontSize: 16, flex: 3}}>手机号</Text>
                                        <TextInput
                                            onChangeText={text => {
                                                this.setState({mobile: text});
                                            }}
                                            placeholderTextColor={'lightgray'}
                                            selectionColor={'#49BC1C'}
                                            placeholder={this.state.mobilePlaceholder}
                                            style={styles.textInput}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>
                                    <View style={styles.pwdDivider}/>
                                </View>
                                <View style={styles.pwdView}>
                                    <View style={styles.pwdContainer}>
                                        <Text style={{fontSize: 16, flex: 3}}>密码</Text>
                                        <TextInput
                                            placeholderTextColor={'lightgray'}
                                            selectionColor={'#49BC1C'}
                                            secureTextEntry={true}
                                            onChangeText={text => {
                                                this.setState({password: text});
                                            }}
                                            placeholder='请输入登录密码'
                                            style={styles.textInput}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>
                                    <View style={styles.pwdDivider}/>
                                    <TouchableOpacity activeOpacity={0.6} onPress={() => this.login()}>
                                        <View style={styles.loginBtn}>
                                            <Text style={{color: "#FFFFFF", fontSize: 16}}>登录</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
                                    <View style={{marginTop: 20}}>
                                        <TouchableOpacity onPress={() => this.goToRegister()}>
                                            <View style={{flexDirection: 'row'}}>
                                                <Text>还没有账号？</Text>
                                                <Text style={{color: 'limegreen'}}>去注册</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{marginTop: 20}}>
                                        <TouchableOpacity onPress={() => this.resetPassword()}>
                                            <View style={{flexDirection: 'row'}}>
                                                <Text>忘记密码？</Text>
                                                <Text style={{color: 'limegreen'}}>去重置</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        </KeyboardAwareScrollView>
                    </View>
                </Provider>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column"
    },
    content: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center"
    },
    pwdView: {
        flexDirection: "column",
        alignItems: "center",
        marginTop: 20
    },
    textInput: {
        flex: 7,
        color:"black"
    },
    pwdContainer: {
        flexDirection: "row",
        height: 50,
        alignItems: "center",
        marginLeft: 40,
        marginRight: 40
    },
    pwdDivider: {
        width: width - 60,
        marginLeft: 30,
        marginRight: 30,
        height: 1,
        backgroundColor: "lightgray"
    },
    textSelect: {
        left: 10,
        flex: 1,
        color: '#63B8FF'
    },
    usernameText: {
        marginTop: 10,
        fontSize: 16,
        textAlign: "center"
    },
    loginBtn: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 50,
        height: 50,
        borderRadius: 3,
        backgroundColor: "#63B8FF",
        justifyContent: "center",
        alignItems: "center"
    },
    changeAccount: {
        fontSize: 16,
        color: "#00BC0C",
        textAlign: "center",
        marginBottom: 20
    }
});
