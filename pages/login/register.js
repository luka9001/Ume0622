import React, {Component} from 'react';
import {Input, Button, ListItem, Text} from 'react-native-elements';
import path from '../service/config'
import {
    View,
    Dimensions,
    AsyncStorage,
    ScrollView,
    ActivityIndicator,
    StyleSheet, TextInput, TouchableOpacity, Platform,
    SafeAreaView, DeviceEventEmitter,
} from 'react-native';
import {
    Toast, Picker, Modal, Provider
} from '@ant-design/react-native';
import serverConfig from '../service/config';
import Utils from "../util/Utils";
import StorageUtil from "../util/StorageUtil";
import CommonTitleBar from '../views/CommonTitleBar';
import LoginApi from '../service/loginApi';
import WebView from "../views/WebView";
import LoadingView from "../views/LoadingView";
import DBHelper from "../util/DBHelper";
import Global from "../util/Global";
import MessageUserInfoUtil from "../util/MessageUserInfoUtil";
import systemInfoApi from "../service/SystemInfoApi";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import _getUserInfo from './index';

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

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobile: '',
            mobilePlaceholder: '请输入手机号码',
            loading: false,
            email: "",
            password: "",
            checkPassword: "",
            code: "",
            nickname: "",
            jusername: "",
            jpassword: "",
            jconfirmPwd: "",
            country: ['西班牙(+34)'],
            countryCode: '+'
        };
    }

    _storeToken = async (access_token, refresh_token) => {
        try {
            // mdata.access_token = access_token;
            // mdata.refresh_token = refresh_token;
            serverConfig.access_token = access_token;
            serverConfig.refresh_token = refresh_token;
            await AsyncStorage.setItem('access_token', access_token);
            await AsyncStorage.setItem('refresh_token', refresh_token);
        } catch (error) {
            // Error saving data
            Toast.info('存储失败，请检查相关权限', 1, undefined, false);
        }
    };

    async register() {
        let mobile = this.state.mobile.trim();
        let password = this.state.password.trim();
        let checkPassword = this.state.checkPassword.trim();
        let code = this.state.code.trim();
        let nickname = this.state.nickname.trim();

        if (Utils.isEmpty(this.state.country)) {
            Modal.alert('提醒', '请先选择国家/地区', [
                {text: '确定'},
            ]);
        } else if (nickname.length >= 10) {
            Toast.info('昵称最多10个字符', 1, undefined, false);
            return;
        } else if (mobile === '' || password === '' || code === '' || nickname === '' || checkPassword === '') {
            Toast.info('请填写完整', 1, undefined, false);
            return;
        } else if (password !== checkPassword) {
            Toast.info('两次密码填写不一致，请核对', 1, undefined, false);
        } else {
            this.setState({
                loading: true
            });
            // if (this.state.country != '其他') {
            // const code = this.state.country.split('(')[1].split(')')[0];
            mobile = this.state.country[0].split('(')[1].split(')')[0] + this.state.mobile.trim();
            // }
            let response = await this.getResister(mobile, password, nickname, code);
            if (!Utils.isEmpty(response.access_token)) {
                let access_token = response.token_type + ' ' + response.access_token;
                let refresh_token = response.token_type + ' ' + response.refresh_token;
                serverConfig.access_token = access_token;
                serverConfig.refresh_token = refresh_token;
                await AsyncStorage.setItem('access_token', access_token);
                await AsyncStorage.setItem('refresh_token', refresh_token);

                serverConfig.name = nickname;
                serverConfig.state = '0';
                await AsyncStorage.setItem('name', nickname);
                await AsyncStorage.setItem('state', '0');

                StorageUtil.set('vip_level', 0);
                StorageUtil.set('vip_start_time', 0);
                StorageUtil.set('coin', 0);

                let userInfo = await _getUserInfo(access_token);
                //发送登录成功消息
                DeviceEventEmitter.emit('appLogin', {user_info:userInfo,access_token:access_token,refresh_token:refresh_token});
            } else if (response['code'] === '201') {
                Toast.info('验证码错误,或者过期', 1, undefined, false);
                this.setState({
                    loading: false
                });
            } else {
                Toast.info('注册失败,昵称或邮件地址重复', 1, undefined, false);
                this.setState({
                    loading: false
                });
            }

        }
    };

    getResister(mobile, password, nickname, code) {
        let url = path.host + '/api/register';
        let obj = {'mobile': mobile, 'code': code, 'password': password, 'nickname': nickname};
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(obj)
        }).then((response) => {
            return response.json();
        }).then((responseJSON) => {
            return responseJSON;
        }).catch((error) => {
            console.log('error:', error);
        });
    };

    getSmsCode() {
        if (Utils.isEmpty(this.state.mobile.trim())) {
            Toast.info('请填写手机号码', 1, undefined, false);
        }
            // if (this.state.country === '其他' && this.state.mobile.trim() === '+') {
            //   Toast.info('请填写手机号码');
        // }
        else {
            // let mobile = this.state.country.split('(')[1].split(')')[0] + this.state.mobile.trim();

            this.setState({loading: true});
            let that = this;
            // if (this.state.country != '其他') {
            const code = this.state.country[0].split('(')[1].split(')')[0];
            let mobile = code + this.state.mobile.trim();
            // }
            LoginApi.getSMSCode(JSON.stringify({mobile})).then(function (params) {
                that.setState({loading: false});
                Toast.info('已发送');
            }, function (error) {
                if (error.code === 201) {
                    Modal.alert('提醒', '上次发送的验证码30分钟内有效', [
                        {text: '我知道了'},
                    ]);
                } else {
                    Toast.info('失败，请联系管理员');
                }
                that.setState({loading: false});
            }).done();
        }
    }

    getEmailCode() {
        let email = this.state.email;
        let url = path.host + '/api/code';
        if (this.state.email === '') {
            Toast.info('请填写Email后再试', 1, undefined, false);
        } else {
            this.setState({
                loading: true
            });
            fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                }),
            }).then((response) => {

                return response.json();
            }).then((responseJSON => {
                if (responseJSON['code'] === '200') {
                    Toast.info('验证码已发送到邮箱', 1, undefined, false);
                } else if (responseJSON['code'] === '201') {
                    Toast.info('上次发送的验证码未过期,有效期5分钟,注意超时临界', 1, undefined, false);
                } else {
                    Toast.info('获取验证码失败', 1, undefined, false);
                }
                this.setState({
                    loading: false
                });
            })).catch((error) => {
                console.log(error);
            });
        }
    };

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

    goToPPView() {
        this.props.navigation.navigate('WebView', {
            url: 'https://sites.google.com/site/umeprivacypolicy/',
            title: '隐私政策'
        });
    }

    gotoTCView() {
        this.props.navigation.navigate('WebView', {
            url: 'https://sites.google.com/site/umeprivacypolicy/terms-conditions',
            title: '服务条款'
        });
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        {this.state.loading ? (
                            <LoadingView
                                cancel={() => this.setState({loading: false})}
                            />
                        ) : null}
                        <CommonTitleBar title={'注册'} nav={this.props.navigation}/>
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
                            <ScrollView style={{marginTop: 20}}>
                                <View style={styles.pwdView}>
                                    <View style={styles.pwdContainer}>
                                        <Text style={{fontSize: 16, flex: 3}}>昵称</Text>
                                        <TextInput
                                            placeholderTextColor={'lightgray'}
                                            selectionColor={'#49BC1C'}
                                            onChangeText={text => {
                                                this.setState({nickname: text});
                                            }}
                                            placeholder='请输入昵称'
                                            style={styles.textInput}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>
                                    <View style={styles.pwdDivider}/>
                                </View>

                                <Picker
                                    data={serverConfig.coutryCode}
                                    cols={1}
                                    onChange={this.onCountryCodeStatusChange}
                                    value={this.state.country}
                                    onOk={(v: any) => this.setState({country: v})}
                                >
                                    <SelectItem>国家/地区</SelectItem>
                                </Picker>

                                <View style={styles.pwdView}>
                                    <View style={styles.pwdContainer}>
                                        <Text style={{fontSize: 16, flex: 3}}>手机号</Text>
                                        <TextInput
                                            placeholderTextColor={'lightgray'}
                                            selectionColor={'#49BC1C'}
                                            onChangeText={text => {
                                                this.setState({mobile: text});
                                            }}
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
                                </View>

                                <View style={styles.pwdView}>
                                    <View style={styles.pwdContainer}>
                                        <Text style={{fontSize: 16, flex: 3}}>确认密码</Text>
                                        <TextInput
                                            placeholderTextColor={'lightgray'}
                                            selectionColor={'#49BC1C'}
                                            secureTextEntry={true}
                                            onChangeText={text => {
                                                this.setState({checkPassword: text});
                                            }}
                                            placeholder='请再次输入密码'
                                            style={styles.textInput}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>
                                    <View style={styles.pwdDivider}/>
                                </View>

                                <View style={styles.pwdView}>
                                    <View style={styles.pwdContainer}>
                                        <Text style={{fontSize: 16, flex: 3}}>验证码</Text>
                                        <TextInput
                                            placeholderTextColor={'lightgray'}
                                            selectionColor={'#49BC1C'}
                                            onChangeText={text => {
                                                this.setState({code: text});
                                            }}
                                            placeholder='验证码'
                                            style={styles.textInput}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>
                                    <View style={styles.pwdDivider}/>
                                </View>

                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
                                    <TouchableOpacity activeOpacity={0.6} onPress={() => this.getSmsCode()}>
                                        <View style={styles.loginBtn}>
                                            <Text style={{color: "#FFFFFF", fontSize: 16}}>获取短信验证码</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity activeOpacity={0.6} onPress={() => this.register()}>
                                        <View style={styles.registerBtn}>
                                            <Text style={{color: "#FFFFFF", fontSize: 16}}>注 册</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{margin: 10}}>
                                    <View style={{alignItems: 'center'}}>
                                        <Text>注册或登录表示您同意我们的</Text>
                                        <TouchableOpacity onPress={() => this.goToPPView()}>
                                            <Text style={{color: 'limegreen'}}>隐私政策</Text>
                                        </TouchableOpacity>
                                        <Text>和</Text>
                                        <TouchableOpacity onPress={() => this.gotoTCView()}>
                                            <Text style={{color: 'limegreen'}}>服务条款</Text>
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

export default Index;

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
    registerBtn: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
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
