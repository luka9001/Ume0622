import React, {Component} from 'react';
import {Icon, CheckBox} from 'react-native-elements';
import {View, ScrollView, StyleSheet, Dimensions, Image, TextInput, Text, TouchableOpacity,SafeAreaView} from 'react-native';
import SYImagePicker from 'react-native-syan-image-picker';
import {Toast, Provider, Modal, DatePicker} from '@ant-design/react-native';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from "../views/LoadingView";
import {ListItem, InputItem, SelectItem} from "../views/ItemView";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Global from '../util/Global';
import request from '../service/request';
import GlobalStyles from '../styles/Styles';
import moment from "moment";
import Utils from '../util/Utils';
import FastImage from "react-native-fast-image";
import TimeUtils from "../util/TimeUtil";
import config from "../service/config";
import SuccessView from "../views/SuccessView";

let {width} = Dimensions.get('window');

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            photos: [],
            title: '',
            text: '',
            checkedIndex: 1,
            total: 0,
            male: 0,
            female: 0,
            address: '',
            end_at: '活动开始日期',
            data: ''
        };
    }

    init() {
        const that = this;
        request.get('v1/getparty/' + this.props.navigation.state.params.id).then(function (res) {
            let data = res;
            that.setState({
                data,
                loading: false
            });
        }, function (error) {
            that.setState({
                loading: false
            });
            that._alert('获取数据失败');
        }).done();
    }

    componentDidMount(): void {
        if (!Utils.isEmpty(this.props.navigation.state.params.id)) {
            this.init();
        }
    }

    _alert(content) {
        Modal.alert('提醒', content, [{text: '知道了'}]);
    }

    countMaleAndFemale() {
        return parseInt(this.state.male) + parseInt(this.state.female);
    }

    checkStatusItem = () => {
        switch (this.state.check_status) {
            case 0: {
                return (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon
                            name='bullhorn'
                            type='material-community'
                            color='#63B8FF'
                            size={20}
                            iconStyle={{width: 20, height: 20}}
                        />
                        <Text
                            style={{fontSize: 15, textAlign: 'center', color: '#63B8FF', marginLeft: 10}}>正在等待审核</Text>
                    </View>
                );
            }
            case 1: {
                return (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        {/*<Icon*/}
                        {/*    name='check-all'*/}
                        {/*    type='material-community'*/}
                        {/*    color='#19AD17'*/}
                        {/*    size={20}*/}
                        {/*    iconStyle={{width: 20, height: 20}}*/}
                        {/*/>*/}
                        <Image
                            source={require('../images/stamp.png')}
                            style={{
                                width: 25,
                                height: 25
                            }}
                        />
                        <Text style={{fontSize: 15, textAlign: 'center', color: '#19AD17', marginLeft: 10}}>已审核</Text>
                    </View>
                );
            }
            case 2: {
                return (
                    <View style={{alignItems: 'center'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <Icon
                                name='alert-decagram'
                                type='material-community'
                                color='red'
                                size={20}
                                iconStyle={{width: 20, height: 20}}
                            />
                            <Text style={{
                                fontSize: 15,
                                textAlign: 'center',
                                color: 'red',
                                marginLeft: 10
                            }}>未通过审核，请重新上传资料</Text>
                        </View>
                        <Text style={{
                            fontSize: 15,
                            textAlign: 'center',
                            color: 'red',
                        }}>原因:{this.state.check_detail}</Text>
                    </View>
                );
            }
            default : {
                return (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: width}}>
                        {/*<Icon*/}
                        {/*    name='bullhorn'*/}
                        {/*    type='material-community'*/}
                        {/*    color='#63B8FF'*/}
                        {/*    size={20}*/}
                        {/*    iconStyle={{width: 20, height: 20}}*/}
                        {/*/>*/}
                        <Text
                            style={{
                                fontSize: 15,
                                textAlign: 'left',
                                color: '#63B8FF',
                                marginLeft: 10
                            }}>请亲耐心等待审核结果，我们会在24小时内结束审核，之后发布的活动将可见\n</Text>
                    </View>
                );
            }
        }
    };

    getAvatar() {
        if (!Utils.isEmpty(this.state.data)) {
            return {uri: config.host + JSON.parse(this.state.data.userPhoto)[0]};
        }
        return null;
    }

    getSexView() {
        if (!Utils.isEmpty(this.state.data.sex)) {
            switch (this.state.data.sex) {
                case 0: {
                    return (
                        <Icon
                            name='gender-male'
                            type='material-community'
                            color='#6495ED'
                            style={{marginRight: 8}}
                            size={15}
                        />
                    );
                }
                case 1: {
                    return (
                        <Icon
                            name='gender-female'
                            type='material-community'
                            color='#EE6A50'
                            style={{marginRight: 8}}
                            size={15}
                        />
                    );
                }
            }
        }
    }

    getFirstImg() {
        if (!Utils.isEmpty(this.state.data)) {
            console.log('qianyuan', config.host + '/uploadFile/party/' + JSON.parse(this.state.data.photos)[0]);
            return {uri: config.host + '/uploadFile/party/' + JSON.parse(this.state.data.photos)[0]};
        }
    }

    getBottomImg() {
        if (!Utils.isEmpty(this.state.data)) {
            let photos = JSON.parse(this.state.data.photos);
            let photoViewArr = [];
            if (photos.length > 1) {
                photos.map((photo, index) => {
                        if (index !== 0) {
                            photoViewArr.push(
                                <View style={[styles.item, {justifyContent: 'center'}]}>
                                    <FastImage
                                        source={{uri: config.host + '/uploadFile/party/' + photo}}
                                        style={{
                                            marginBottom: 10,
                                            width: width - 40,
                                            height: 300
                                        }}/>
                                </View>)
                        }
                    }
                );
                return photoViewArr;
            }
        }
    }

    getCheckCountView() {
        if (!Utils.isEmpty(this.state.data)) {
            switch (this.state.data.type) {
                case 1: {
                    return (
                        <View style={styles.item}>
                            <View style={{flex: 3}}>
                                <Text style={styles.subtitle}>报名人数:</Text>
                            </View>
                            <View style={{flex: 12}}>
                                <Text style={styles.subtitle}>{this.state.data.sTotal}/不限</Text>
                            </View>
                        </View>
                    );
                }
                case 2: {
                    return (

                        <View style={styles.item}>
                            <View style={{flex: 3}}>
                                <Text style={styles.subtitle}>人数:</Text>
                            </View>
                            <View style={{flex: 12}}>
                                <Text style={styles.subtitle}>{this.state.data.sTotal}/{this.state.data.total}人</Text>
                            </View>
                        </View>
                    );
                }
                case 3: {
                    return (
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            <View style={styles.item}>
                                <View style={{flex: 3}}>
                                    <Text style={styles.subtitle}>男:</Text>
                                </View>
                                <View style={{flex: 12}}>
                                    <Text
                                        style={styles.subtitle}>{this.state.data.sMaleCount}/{this.state.data.male}人</Text>
                                </View>
                            </View>
                            <View style={styles.item}>
                                <View style={{flex: 3}}>
                                    <Text style={styles.subtitle}>女:</Text>
                                </View>
                                <View style={{flex: 12}}>
                                    <Text
                                        style={styles.subtitle}>{this.state.data.sFemaleCount}/{this.state.data.female}人</Text>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }
    }

    gotoDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {id});
    };

    vipLevelView(level) {
        switch (level) {
            case 1:
                return (
                    <Image style={{width: 25, height: 25}}
                           source={require("../images/vip1.png")}/>
                );
            case 2:
                return (
                    <Image style={{width: 25, height: 25}}
                           source={require("../images/vip2.png")}/>
                );
            case 3:
                return (
                    <Image style={{width: 25, height: 25}}
                           source={require("../images/vip3.png")}/>
                );
            default :
                return null
        }
    }

    partySignUp() {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
        } else {
            const that = this;
            const params = JSON.stringify({
                pid: this.state.data.id,
                ptype: this.state.data.type,
                ptotal: this.state.data.total,
                pmale: this.state.data.male,
                pfemale: this.state.data.female
            });
            request.postWithLoginCheck('v1/postpartysignup', params).then(
                function (res) {
                    that.setState({success: true})
                },
                function (error) {
                    if (error.code === 203) {
                        Modal.alert('提醒', '该活动您已经报名了', [{text: '知道了'}]);
                    }
                }
            ).done();
        }
    }

    render() {
        const {photos} = this.state;
        return (
            <SafeAreaView
                forceInset={{vertical: 'never', top: 'always'}}
                style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        {
                            this.state.success ? (
                                <SuccessView text={'报名成功了'} ok={() => {
                                    this.setState({success: false});
                                    this.setState({loading: true});
                                    this.init();
                                }}
                                />
                            ) : null
                        }
                        {
                            this.state.loading ? (
                                <LoadingView
                                    cancel={() => this.setState({loading: false})}
                                />
                            ) : null
                        }
                        <CommonTitleBar
                            title={"报名活动"}
                            nav={this.props.navigation}
                        />
                        <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
                            <View style={styles.item}>
                                {/*<Image style={{width: 20, height: 20}}*/}
                                {/*       source={require("../images/party.png")}/>*/}
                                <Text style={styles.title}>{this.state.data.title}</Text>
                            </View>

                            <View style={styles.userContainer}>
                                <TouchableOpacity onPress={() => {
                                    this.gotoDetail(this.state.data.uid)
                                }}>
                                    <FastImage style={styles.avatar} source={this.getAvatar()}/>
                                </TouchableOpacity>
                                <View style={styles.userContent}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        {this.vipLevelView(this.state.data.vip_level)}
                                        <Text style={styles.nameText}>{this.state.data.name}</Text>
                                        {this.getSexView()}
                                        <View>
                                            <Text style={{
                                                fontSize: 14,
                                                color: "#969696"
                                            }}>{this.state.data.live}</Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={styles.timeText}>
                                            {Utils.isEmpty(this.state.data.created_at) ? null : TimeUtils.getFormattedTime(this.state.data.created_at)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.item}>
                                {/*<Image style={{width: 20, height: 20}}*/}
                                {/*       source={require("../images/map-location.png")}/>*/}

                                <View style={{flex: 3}}>
                                    <Text style={styles.subtitle}>地址:</Text>
                                </View>
                                <View style={{flex: 12}}>
                                    <Text style={styles.subtitle}>{this.state.data.address}</Text>
                                </View>
                            </View>
                            <View style={styles.item}>
                                {/*<Image style={{width: 20, height: 20}}*/}
                                {/*       source={require("../images/time.png")}/>*/}
                                <View style={{flex: 3}}>
                                    <Text style={styles.subtitle}>开始日期:</Text>
                                </View>
                                <View style={{flex: 12}}>
                                    <Text style={styles.subtitle}>{this.state.data.end_at}</Text>
                                </View>
                            </View>
                            {this.getCheckCountView()}
                            <View style={[styles.item, {justifyContent: 'center'}]}>
                                <FastImage
                                    source={this.getFirstImg()}
                                    style={{
                                        marginBottom: 10,
                                        width: width - 40,
                                        height: 300
                                    }}/>
                            </View>
                            <View style={styles.item}>
                                {/*<Image style={{width: 20, height: 20}}*/}
                                {/*       source={require("../images/publish_party.png")}/>*/}
                                <Text style={styles.content}>{this.state.data.text}</Text>
                            </View>
                            {this.getBottomImg()}
                            <View style={{height: 90, backgroundColor: 'white'}}/>
                        </ScrollView>
                        <View style={styles.contentFindView}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this.partySignUp()}>
                                <View style={[styles.loginBtn, {backgroundColor: 'orange'}]}>
                                    <Image style={{width: 30, height: 30}}
                                           source={require("../images/check_in.png")}/>
                                    <Text style={{
                                        color: "#ffffff",
                                        fontSize: 13
                                    }}>我要报名</Text>
                                </View>
                            </TouchableOpacity>
                            {/*<TouchableOpacity activeOpacity={0.6} onPress={() => this._matchMakerView(item.id)}>*/}
                            {/*    <View style={[styles.loginBtn, {backgroundColor: 'lightcoral'}]}>*/}
                            {/*        <Image style={{width: 30, height: 30, marginTop: 5, marginBottom: 5}}*/}
                            {/*               source={require("../images/party_dance.png")}/>*/}
                            {/*        <Text style={{color: "#ffffff", fontSize: 13, marginBottom: 5}}>查看已报名</Text>*/}
                            {/*    </View>*/}
                            {/*</TouchableOpacity>*/}
                        </View>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        marginLeft: 10,
        fontSize: 20,
        textAlign: 'center'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 5
    },
    userContainer: {
        width: width,
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 20
    },
    userContent: {
        flex: 1,
        flexDirection: "column",
        marginLeft: 10
    },
    // title: {
    //     marginLeft: 10,
    //     fontSize: 20,
    //     flex: 1,
    // },
    subtitle: {
        marginLeft: 10,
        fontSize: 14,
        color: "#969696",
    },
    content: {
        marginLeft: 10,
        fontSize: 20,
        flex: 1,
    },
    item: {
        flexDirection: 'row', alignItems: 'center', marginLeft: 10,
        marginRight: 20,
        marginBottom: 10
    },
    pwdView: {
        flexDirection: "column",
        alignItems: "center",
        marginTop: 20
    },
    textInput: {
        textAlign: 'right',
        fontSize: 16
    },
    pwdContainer: {
        flexDirection: "row",
        // height: 50,
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20
    },
    pwdDivider: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
        height: 1,
        backgroundColor: "lightgray"
    },
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        paddingTop: 40
    },
    btn: {
        backgroundColor: '#FDA549',
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 12,
        margin: 5,
        borderRadius: 22
    },
    scroll: {
        padding: 5,
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    image: {
        margin: 10,
        width: (width - 80) / 3,
        height: (width - 80) / 3,
        backgroundColor: '#F0F0F0'
    },
    timeText: {
        flex: 1,
        fontSize: 12,
        color: "#999999"
    },
    nameText: {
        marginLeft: 5,
        marginRight: 8,
        fontSize: 15,
        color: "#54688D"
    },
    contentFindView: {
        flex: 1,
        width: width - 10,
        position: "absolute",
        bottom: 5,
        left: 5,
        right: 5,
        justifyContent: 'space-around',
        flexDirection: 'row'
    },
    loginBtn: {
        height: 50,
        width: width - 40,
        borderRadius: 3,
        backgroundColor: "#63B8FF",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row'
    }
});

export default Index;
