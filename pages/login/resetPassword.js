import React, {Component} from 'react';
import {Input, Button, ListItem, Text} from 'react-native-elements';
import path from '../service/config';
import {
    View,
    Dimensions,
    AsyncStorage,
    ScrollView,
    StyleSheet,
    TouchableOpacity, TextInput,
    SafeAreaView, DeviceEventEmitter,
} from 'react-native';
import {
    Toast, Picker, Modal, Provider,
} from '@ant-design/react-native';
import serverConfig from '../service/config';
import Utils from '../util/Utils';
import StorageUtil from '../util/StorageUtil';
import DBHelper from '../util/DBHelper';
import MessageUserInfoUtil from '../util/MessageUserInfoUtil';
import Global from '../util/Global';
import CommonTitleBar from '../views/CommonTitleBar';
import LoginApi from '../service/loginApi';
import LoadingView from '../views/LoadingView';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

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
            email: '',
            password: '',
            checkPassword: '',
            code: '',
            nickname: '',
            jusername: '',
            jpassword: '',
            jconfirmPwd: '',
            country: ['中国(+86)'],
            countryCode: '+',
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

    async resetP() {
        let mobile = this.state.mobile.trim();
        let password = this.state.password.trim();
        let checkPassword = this.state.checkPassword.trim();
        let code = this.state.code.trim();
        if (mobile === '' || password === '' || code === '' || checkPassword === '') {
            Toast.info('请填写完整', 1, undefined, false);
            return;
        }
            // else if (response === '401') {
            //   alert('账号密码错误！');
        // }
        else if (password !== checkPassword) {
            Toast.info('两次密码填写不一致，请核对', 1, undefined, false);
            return;
        } else {
            this.setState({
                loading: true,
            });
            // if (this.state.country != '其他') {
            mobile = this.state.country[0].split('(')[1].split(')')[0] + mobile;
            // }

            const response = await this._resetPassWord(JSON.stringify({mobile, password, code}));

            if (response.access_token === undefined) {
                if (response.msg !== undefined) {
                    Toast.info(response.msg);
                } else {
                    Toast.info('登录失败！未知错误！');
                }
            } else {
                let access_token = response.token_type + ' ' + response.access_token;
                let refresh_token = response.token_type + ' ' + response.refresh_token;
                this._storeToken(access_token, refresh_token);
                let userInfo = await this._getUserInfo(access_token);

                //发送登录成功消息
                //TODO::重置密码比较特殊需要重新再调整
                DeviceEventEmitter.emit('appLogin', {
                    user_info: userInfo,
                    access_token: access_token,
                    refresh_token: refresh_token,
                });

                serverConfig.name = userInfo.name;
                serverConfig.state = userInfo.state.toString();

                await AsyncStorage.setItem('name', userInfo.name.toString());
                await AsyncStorage.setItem('state', userInfo.state.toString());

                // serverConfig.sex = userInfo.sex;
                // StorageUtil.set('sex', userInfo.sex);

                StorageUtil.set('vip_level', userInfo.vip_level > 0 ? userInfo.vip_level : 0);
                StorageUtil.set('vip_start_time', userInfo.vip_start_time != null ? userInfo.vip_start_time : 0);
                StorageUtil.set('coin', userInfo.coin > 0 ? userInfo.coin : 0);

                if (userInfo.state === 0) {
                    this.props.navigation.replace('EditWdIndex');
                } else {
                    // let jUserName = serverConfig.jMessageAccountHeader + userInfo.id;
                    // this.j_register_status = userInfo.j_register_status;
                    // if (userInfo.j_register_status === 0) {
                    //     this.registerToJIM(jUserName, jUserName);
                    // } else {
                    //     this.loginToJIM(jUserName, jUserName);
                    // }

                    serverConfig.lifephotos = JSON.parse(userInfo.lifephoto)[0].toString();
                    // console.log(JSON.parse(userInfo.lifephoto)[0]);
                    await AsyncStorage.setItem('lifephotos', userInfo.lifephoto);
                    // AsyncStorage.setItem('sex', userInfo.sex.toString());

                    serverConfig.sex = userInfo.sex;
                    StorageUtil.set('sex', userInfo.sex);

                    this.props.navigation.goBack();
                }

                this.setState({
                    loading: false,
                });
            }
        }
    };

    _getUserInfo(access_token) {
        let url = path.host + '/api/v1/getuserinfo';
        return fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': access_token,
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
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

    _resetPassWord(params) {
        let url = path.host + '/api/rp';
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: params,
        }).then((response) => response.json()).then((responseJson) => {
            return responseJson;
        }).catch((error) => {
            console.log('error:', error);
        });
    }

    getSmsCode() {
        if (Utils.isEmpty(this.state.mobile.trim())) {
            Toast.info('请填写手机号码', 1, undefined, false);
        }
            // if (this.state.country === '其他' && this.state.mobile.trim() === '+') {
            //   Toast.info('请填写手机号码');
        // }
        else {
            // let mobile = this.state.mobile.trim();
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

    onCountryCodeStatusChange = (value: any) => {
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
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        {this.state.loading ? (
                            <LoadingView
                                cancel={() => this.setState({loading: false})}
                            />
                        ) : null}
                        <CommonTitleBar title={'重置密码'} nav={this.props.navigation}/>
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
                                            <Text style={{color: '#FFFFFF', fontSize: 16}}>获取短信验证码</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity activeOpacity={0.6} onPress={() => this.resetP()}>
                                        <View style={styles.registerBtn}>
                                            <Text style={{color: '#FFFFFF', fontSize: 16}}>重置密码</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </KeyboardAwareScrollView>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    pwdView: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
    },
    textInput: {
        flex: 7,
        color: 'black',
    },
    textSelect: {
        left: 10,
        flex: 1,
        color: '#63B8FF',
    },
    usernameText: {
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    pwdContainer: {
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        marginLeft: 40,
        marginRight: 40,
    },
    pwdDivider: {
        width: width - 60,
        marginLeft: 30,
        marginRight: 30,
        height: 1,
        backgroundColor: 'lightgray',
    },
    loginBtn: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 50,
        height: 50,
        borderRadius: 3,
        backgroundColor: '#63B8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerBtn: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        height: 50,
        borderRadius: 3,
        backgroundColor: '#63B8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeAccount: {
        fontSize: 16,
        color: '#00BC0C',
        textAlign: 'center',
        marginBottom: 20,
    },
});
