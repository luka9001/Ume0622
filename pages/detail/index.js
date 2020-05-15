import React, {Component} from 'react';
import {Icon, Button, Divider, ListItem} from 'react-native-elements'
import {
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    View,
    Text,
    Dimensions,
    Modal, ActivityIndicator,SafeAreaView
} from 'react-native';
import api from "../service/allMembersApi";
import config from "../service/config";
import {Carousel, Toast, Provider} from '@ant-design/react-native';
import serverConfig from '../service/config';
import CommonTitleBar from '../views/CommonTitleBar';
import Global from '../util/Global';
import JMessage from "jmessage-react-plugin";
import pfmApi from '../service/price';
import StorageUtil from "../util/StorageUtil";
import {withNavigationFocus} from 'react-navigation';
import ImageViewer from "react-native-image-zoom-viewer";
import AntmModal from '@ant-design/react-native/lib/modal/Modal';
import LoadingView from "../views/LoadingView";
import {ListItem as CusListItem} from "../views/ItemView";
import Utils from '../util/Utils';
import FastImage from 'react-native-fast-image';
import {Download} from "../util/DownloadToCamera";

let {height,width} = Dimensions.get('window');
const url = config.host;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            favorateBtnText: '关注',
            favorateLoading: true,
            favorateIcon: 'account-plus',
            blackListBtn: '黑名单',
            vipLevel: 0,
            coin: 0,
            vip_start_time: null,
            coinViewState: false,
            par_for_message: false,
            payLoadingStatus: false,
            payCoin: 0,
            imageViewerStatus: false,
            imageViewerSource: [],
            imageViewerIndex: 0,
            payViewStatus: false,
            checkStatus: 0
        };
        this.id = this.props.navigation.state.params.id;
        // this._getMemberData(this.props.navigation.state.params.id);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.isFocused) {
            this.setState({
                favorateLoading: true
            });
            this._getMemberData(this.id);
            const that = this;
            StorageUtil.get('check_status', function (error, object) {
                if (object !== null) {
                    that.setState({
                        checkStatus: object
                    });
                }
            });
            return true;
        } else {
            return false;
        }
    }

    _getMemberData = (id) => {
        const that = this;
        api.getMemberData(id).then(function (message) {
            if (message.favoriteMeUid) {
                that.setState({
                    favorateIcon: 'account-heart-outline',
                    favorateBtnText: '已关注'
                });
            }
            if (message.blackListUid) {
                that.setState({
                    blackListBtn: '已拉黑'
                });
            }
            that.setState({
                data: message,
                favorateLoading: false,
                //获取会员与心动币信息
                vipLevel: message.vip_level !== null ? message.vip_level : 0,
                coin: message.coin !== null ? message.coin : 0,
                vip_start_time: message.vip_start_time !== null ? message.vip_start_time : null,
                par_for_message: message.par_for_message !== null ? message.par_for_message : false,
                payCoin: message.payCoin !== null ? message.payCoin : 0
            });

            StorageUtil.set('vip_level', that.state.vipLevel > 0 ? that.state.vipLevel : 0);
            StorageUtil.set('vip_start_time', that.state.vip_start_time != null ? that.state.vip_start_time : 0);
        }, function (error) {
        }).done();
    };

    _sayHi(id, name, avatar) {
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
        } else if (config.state === '1' && config.sex === '0' && this.state.vipLevel === 0 && !this.state.par_for_message) {
            this.setState({
                payViewStatus: true
            });
        }
            // else if (config.state === '1' && config.sex === '1' && !this.state.par_for_message) {
            //   this.setState({
            //     coinViewState: true
            //   });
        // }
        else if (config.state === '1' && config.sex === '0' && (this.state.vipLevel !== 0 || this.state.par_for_message)) {
            this.props.navigation.navigate("Chatting", {
                contactId: config.jMessageAccountHeader + id,
                name,
                avatar: url + avatar,
                type: 'single'
            });
        } else if (config.state === '1' && config.sex === '1') {
            this.props.navigation.navigate("Chatting", {
                contactId: config.jMessageAccountHeader + id,
                name,
                avatar: url + avatar,
                type: 'single'
            });
        }
    }

    payForMessage(id, name) {
        this.setState({
            payLoadingStatus: true
        });
        let that = this;
        pfmApi.payForMessage(JSON.stringify({
            'message_uid': id,
            'payCoin': this.state.payCoin
        })).then(function (params) {
            that.setState({
                par_for_message: true,
                coin: that.state.coin - 100,
                payLoadingStatus: false,
                coinViewState: false,
                favorateLoading: false
            });

            that.props.navigation.navigate("Chatting", {
                contactId: config.jMessageAccountHeader + id,
                name,
                avatar: null,
                type: 'single'
            });
        }, function (error) {
            that.setState({
                payLoadingStatus: false,
                coinViewState: false
            });
        }).done();
    }

    _favarite(id) {
        if (this.state.favorateBtnText === '关注') {
            this._saveFavarite(id);
        } else {
            this._delFavorite(id);
        }
    }

    _saveFavarite(id) {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.setState({
                favorateLoading: true
            });
            let that = this;
            api.postFavorite(id).then(function (message) {
                that.setState({
                    favorateLoading: false,
                    favorateBtnText: '已关注',
                    favorateIcon: 'account-heart-outline'
                });

            }).done();
        }
    }

    _delFavorite(id) {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else {
            this.setState({
                favorateLoading: true
            });
            let that = this;
            api.postDelFavorite(id).then(function (message) {
                that.setState({
                    favorateLoading: false,
                    favorateBtnText: '关注',
                    favorateIcon: 'account-plus'
                });

            }).done();
        }
    }

    _matchMakerView(id) {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        }
            // else if (config.state === '1' && config.sex === '0') {
            //   Toast.info('该功能需要会员才能使用！', 1, undefined, false);
            //   this.props.navigation.navigate('Price');
        // }
        else {
            this.props.navigation.navigate('MatchMaker', {
                id,
                'vipLevel': this.state.vipLevel,
                'coin': this.state.coin,
                'vip_start_time': this.state.vip_start_time
            });
        }
    }

    blackList(id) {
        // alert(id);
        if (this.state.blackListBtn === '黑名单') {
            this.addblackList(id);
        } else {
            this.delBlackList(id);
        }
    }

    delBlackList(id) {
        let that = this;
        this.setState({favorateLoading: true});
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else {
            api.delBlackList(JSON.stringify({id})).then(function (message) {
                if (message.code === 200) {
                    JMessage.removeUsersFromBlacklist({
                            usernameArray: [config.jMessageAccountHeader + id],
                            appKey: Global.JIMAppKey
                        },
                        () => {
                            // do something.
                            that.setState({blackListBtn: '黑名单', favorateLoading: false,});
                        }, (error) => {
                            let code = error.code;
                            let desc = error.description;
                            that.setState({favorateLoading: false});
                            //表示该用户注册失败
                            if (code === 818002) {

                            } else {
                                AntmModal.alert('提醒', '移除黑名单失败，请再次尝试', [
                                    {text: '我知道了'},
                                ]);
                            }
                        })
                }
            }, function (error) {

            }).done();
        }
    }

    addblackList(id) {
        let that = this;
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.setState({favorateLoading: true});
            api.postBlackList(JSON.stringify({id})).then(function (message) {
                if (message.code === 200) {
                    JMessage.addUsersToBlacklist({
                            usernameArray: [config.jMessageAccountHeader + id],
                            appKey: Global.JIMAppKey
                        },
                        () => {
                            // do something.
                            that.setState({favorateLoading: false, blackListBtn: '已拉黑'});
                        }, (error) => {
                            let code = error.code;
                            let desc = error.description;
                            that.setState({favorateLoading: false});
                            //表示该用户注册失败
                            if (code === 818002) {

                            } else {
                                AntmModal.alert('提醒', '添加黑名单失败，请再次尝试', [
                                    {text: '我知道了'},
                                ]);
                            }
                        })
                }
            }, function (error) {

            }).done();
        }
    }

    getStatusParamString = (_index, array) => {
        let _data;
        array.map((data, index) => {
            if (_index === index) {
                _data = data.value;
            }
        });
        return _data;
    };

    getHeightSpan = (minHeight, maxHeight) => {
        if (minHeight != null || maxHeight != null) {
            minHeight = minHeight != null ? minHeight : '?';
            maxHeight = maxHeight != null ? maxHeight : '?';
            return <CusListItem
                leftElement={<Image style={{width: 20, height: 20}} source={require("../images/height.png")}/>}
                title={'身高范围'} rightElement={<Text>{minHeight + '-' + maxHeight}</Text>}/>
        }
    };

    grdt = (item, photo) => {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.props.navigation.navigate('GrdtIndex', {id: item.id, name: item.name, photo});
        }
    };

    renderImages(lifephotos) {
        let imagesViewer = [];
        lifephotos.forEach(element => {
            let imgViewer = {url: url + element};
            imagesViewer.push(imgViewer);
        });

        if (lifephotos.length > 1) {
            let images = [];
            for (let i = 0; i < lifephotos.length; i++) {
                images.push(
                    <TouchableOpacity
                        key={"row-image-" + i}
                        activeOpacity={0.6}
                        onPress={() => {
                            this.setState({
                                imageViewerSource: imagesViewer,
                                imageViewerStatus: true,
                                imageViewerIndex: i
                            })
                        }}
                    >
                        <FastImage key={i} source={{uri: url + lifephotos[i], priority: FastImage.priority.normal}}
                                   style={{
                                       width: '100%',
                                       height: 300,
                                       marginTop: 5,
                                       backgroundColor: '#F0F0F0'
                                   }}/>
                    </TouchableOpacity>
                )
            }
            return (
                <Carousel
                    autoplay
                    infinite
                >
                    {images}
                </Carousel>
            );
        } else {
            return (
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => {
                        this.setState({
                            imageViewerSource: imagesViewer,
                            imageViewerStatus: true,
                            imageViewerIndex: 0
                        })
                    }}
                >
                    <FastImage source={{uri: url + lifephotos[0], priority: FastImage.priority.normal}}
                               style={{
                                   width: '100%',
                                   height: 300,
                                   marginTop: 5,
                                   backgroundColor: '#F0F0F0'
                               }}/>
                </TouchableOpacity>
            );
        }
    }

    checkStatusItem = () => {
        switch (this.state.data.check_status) {
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
                            }}>未通过审核</Text>
                        </View>
                    </View>
                );
            }
        }
    };

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

    renderLoad() { //这里是写的一个loading
        return (
            <View style={{marginTop: (height / 2) - 20}}>
                <ActivityIndicator animating={true} size={"large"}/>
            </View>
        )
    }

    render() {
        const image = {
            width: 20,
            height: 20,
            marginRight: 5
        };
        const text = {
            marginRight: 8,
            fontSize: 12,
            color: '#969696'
        };
        const name = {
            fontSize: 20,
        };
        let item = this.state.data;
        let lifephotos = [];
        if (item.lifephoto != null) {
            lifephotos = JSON.parse(item.lifephoto);
        }

        let birthdateStr = '';
        if (item.birthdate != null) {
            birthdateStr = item.birthdate.split('-')[0] + '年 ';
        }
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1}}>
                        <Modal visible={this.state.imageViewerStatus} transparent={true} onRequestClose={() => {
                        }}>
                            <ImageViewer
                                loadingRender={this.renderLoad}
                                menuContext={{"saveToLocal": "保存图片", "cancel": "取消"}}
                                onSave={(url) => {
                                    //保存图片
                                    Download(url).then(
                                        function (result) {
                                            Toast.info('图片已保存至相册', 1, undefined, false);
                                        }, function (error) {
                                            Toast.info('保存失败', 1, undefined, false);
                                        }
                                    ).done();
                                }}
                                onCancel={() => {
                                this.setState({imageViewerStatus: false})
                            }}
                                         enableSwipeDown={true} index={this.state.imageViewerIndex}
                                         imageUrls={this.state.imageViewerSource} onClick={() => {
                                this.setState({
                                    imageViewerStatus: false
                                })
                            }}/>
                        </Modal>
                        {this.state.favorateLoading ? (
                            <LoadingView
                                cancel={() => this.setState({favorateLoading: false})}
                            />
                        ) : null}
                        <AntmModal
                            popup
                            onClose={() => this.setState({payViewStatus: false})}
                            maskClosable={true}
                            visible={this.state.payViewStatus}
                            animationType="slide-up">
                            <ListItem title={'成为会员无限畅聊'} subtitle={'使用心动币单人畅聊'}/>
                            <ListItem
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/vip.png")}/>}
                                title={'成为会员'}
                                bottomDivider={true}
                                onPress={() => this.props.navigation.navigate('Price')}
                            />
                            <ListItem
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/coins.png")}/>}
                                title={'使用心动币'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.setState({
                                        payViewStatus: false,
                                        coinViewState: true
                                    });
                                }}
                            />
                            <ListItem
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/error.png")}/>}
                                title={'取消'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.setState({
                                        payViewStatus: false
                                    })
                                }}
                            />
                        </AntmModal>
                        <AntmModal
                            popup
                            onClose={() => this.setState({coinViewState: false})}
                            maskClosable={true}
                            visible={this.state.coinViewState}
                            animationType="slide-up"
                        >
                            <ListItem title={'需支付' + this.state.payCoin + '枚'} subtitle={'心动币'}/>
                            <ListItem title={this.state.coin + '枚'} subtitle={'我的心动币'} bottomDivider={true}/>
                            {this.state.coin >= this.state.payCoin ?
                                <ListItem
                                    leftElement={<Image style={{width: 20, height: 20}}
                                                        source={require("../images/coins.png")}/>}
                                    title={'支付'}
                                    bottomDivider={true}
                                    onPress={() => {
                                        this.setState({
                                            coinViewState: false,
                                            favorateLoading: true
                                        });
                                        this.payForMessage(item.id, item.name)
                                    }}
                                />
                                :
                                <ListItem
                                    leftElement={<Image style={{width: 20, height: 20}}
                                                        source={require("../images/credit-card.png")}/>}
                                    title={'购买心动币'}
                                    bottomDivider={true}
                                    onPress={() => {
                                        this.setState({
                                            coinViewState: false
                                        });
                                        this.props.navigation.navigate('Coin');
                                    }}
                                />
                            }
                            <ListItem
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/error.png")}/>}
                                title={'取消'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.setState({
                                        coinViewState: false
                                    })
                                }}
                            />
                        </AntmModal>
                        <CommonTitleBar
                            title={"TA的资料"}
                            nav={this.props.navigation}
                            callback={this.props.navigation.state.params.callback != null ? this.props.navigation.state.params.callback : null}
                        />
                        <ScrollView>
                            <View style={{flex: 1}}>
                                <View style={{marginLeft: '5%', marginRight: '5%',}}>
                                    <View style={{marginTop: 15}}>
                                        {this.renderImages(lifephotos)}
                                    </View>
                                    <View style={{
                                        marginTop: 10,
                                        height: 30,
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }}>
                                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={name}>{item.name}</Text>
                                            {this.vipLevelView(item.members_vip_level)}
                                        </View>
                                        {this.checkStatusItem()}
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 5,
                                            height: 30,
                                            flex: 1,
                                            flexDirection: 'row',
                                            flexWrap: 'wrap'
                                        }}>
                                        {item.sex === 0 ? <Icon
                                            name='gender-male'
                                            type='material-community'
                                            color='#6495ED'
                                            size={15}
                                        /> : <Icon
                                            name='gender-female'
                                            type='material-community'
                                            color='#EE6A50'
                                            size={15}
                                        />}
                                        <Text style={text}>{birthdateStr}{item.starsign}</Text>
                                        <Text style={text}>{item.height}</Text>
                                        <Text style={text}>{item.education}</Text>
                                        <Text
                                            style={text}>{this.getStatusParamString(item.marrystatus, serverConfig.marryStatusData)}</Text>
                                    </View>
                                    <View style={{marginTop: 10}}>
                                        <Text style={text}>动态</Text>
                                        <Divider style={{backgroundColor: 'gray'}}/>
                                    </View>
                                    <ListItem
                                        style={{marginTop: 10}}
                                        // leftElement={<Icon
                                        //     name='camera-iris'
                                        //     type='material-community'
                                        //     color='#EE6A50'
                                        // />}
                                        leftElement={<Image style={{width: 20, height: 20}}
                                                            source={require("../images/ins.png")}/>}
                                        title={'查看TA的动态'}
                                        onPress={() => this.grdt(item, lifephotos[0])}
                                        chevron
                                    />
                                    <View style={{marginTop: 20}}>
                                        <Text style={text}>Ta 的个人介绍</Text>
                                        <Divider style={{backgroundColor: 'gray'}}/>
                                        <Text style={{fontSize: 12, marginTop: 5}}>
                                            {Utils.isEmpty(item.detail) ? '未填写' : item.detail + '\n'}
                                        </Text>
                                    </View>

                                    <View style={{marginTop: 20}}>
                                        <Text style={text}>Ta 的关键字</Text>
                                        <Divider style={{backgroundColor: 'gray'}}/>
                                        <View style={{flex: 1, flexDirection: 'column'}}>
                                            <CusListItem leftElement={<Image style={{width: 20, height: 20}}
                                                                             source={require("../images/map-location.png")}/>}
                                                         title={'现居住地'} rightElement={<Text>{item.live}</Text>}/>
                                            <CusListItem leftElement={<Image style={{width: 20, height: 20}}
                                                                             source={require("../images/translation.png")}/>}
                                                         title={'语言'} rightElement={<Text>{item.language}</Text>}/>
                                            <CusListItem leftElement={<Image style={{width: 20, height: 20}}
                                                                             source={require("../images/placeholder.png")}/>}
                                                         title={'籍贯'} rightTitle={item.birthplace}/>
                                            <CusListItem
                                                leftElement={<Image style={{width: 20, height: 20}}
                                                                    source={require("../images/wedding-couple.png")}/>}
                                                title={'婚姻状况'}
                                                rightTitle={this.getStatusParamString(item.marrystatus, serverConfig.marryStatusData)}
                                            />

                                            {item.occupation != null ?
                                                <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/meeting.png")}/>}
                                                    title={'职业'}
                                                    rightTitle={item.occupation}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/meeting.png")}/>}
                                                    title={'职业'}
                                                    rightTitle={'未填写'}
                                                />}
                                            {item.hobby != null ? <CusListItem
                                                // leftIcon={<Icon
                                                //   name='account-heart-outline'
                                                //   type='material-community'
                                                //   color='pink'
                                                //   size={20}
                                                //   iconStyle={image}
                                                // />}
                                                leftElement={<Image style={{width: 20, height: 20}}
                                                                    source={require("../images/jigsaw.png")}/>}
                                                title={'兴趣爱好'}
                                                rightTitle={item.hobby}
                                            /> : <CusListItem
                                                // leftIcon={<Icon
                                                //   name='account-heart-outline'
                                                //   type='material-community'
                                                //   color='pink'
                                                //   size={20}
                                                //   iconStyle={image}
                                                // />}
                                                leftElement={<Image style={{width: 20, height: 20}}
                                                                    source={require("../images/jigsaw.png")}/>}
                                                title={'兴趣爱好'}
                                                rightTitle={'未填写'}
                                            />}
                                            {item.religion != null ? <CusListItem
                                                // leftIcon={<Icon
                                                //   name='judaism'
                                                //   type='material-community'
                                                //   color='brown'
                                                //   size={20}
                                                //   iconStyle={image}
                                                // />}
                                                leftElement={<Image style={{width: 20, height: 20}}
                                                                    source={require("../images/jesus.png")}/>}
                                                title={'宗教信仰'}
                                                rightTitle={this.getStatusParamString(item.religion, serverConfig.religion)}
                                            /> : <CusListItem
                                                // leftIcon={<Icon
                                                //   name='judaism'
                                                //   type='material-community'
                                                //   color='brown'
                                                //   size={20}
                                                //   iconStyle={image}
                                                // />}
                                                leftElement={<Image style={{width: 20, height: 20}}
                                                                    source={require("../images/jesus.png")}/>}
                                                title={'宗教信仰'}
                                                rightTitle={'未填写'}
                                            />}
                                            {item.income != null ? <CusListItem
                                                leftElement={<Image style={{width: 20, height: 20}}
                                                                    source={require("../images/income.png")}/>}
                                                title={'月收入'}
                                                rightTitle={this.getStatusParamString(item.income, serverConfig.inComeData)}
                                            /> : <CusListItem
                                                leftElement={<Image style={{width: 20, height: 20}}
                                                                    source={require("../images/income.png")}/>}
                                                title={'月收入'}
                                                rightTitle={'未填写'}
                                            />}
                                            {
                                                item.car != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='car'
                                                    //   type='material-community'
                                                    //   color='#63B8FF'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/car.png")}/>}
                                                    title={'私家车'}
                                                    rightTitle={this.getStatusParamString(item.car, serverConfig.carData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/car.png")}/>}
                                                    title={'私家车'}
                                                    rightTitle={'未填写'}
                                                />
                                            }
                                            {
                                                item.house != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='home-city-outline'
                                                    //   type='material-community'
                                                    //   color='orange'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/house.png")}/>}
                                                    title={'房产'}
                                                    rightTitle={this.getStatusParamString(item.house, serverConfig.houseData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/house.png")}/>}
                                                    title={'房产'}
                                                    rightTitle={'未填写'}
                                                />
                                            }
                                            {
                                                item.smoke != null ? <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/smoking.png")}/>}
                                                    title={'抽烟'}
                                                    rightTitle={this.getStatusParamString(item.smoke, serverConfig.smokeData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/smoking.png")}/>}
                                                    title={'抽烟'}
                                                    rightTitle={'未填写'}
                                                />
                                            }
                                            {
                                                item.drink != null ? <CusListItem
                                                        // leftIcon={<Icon
                                                        //   name='glass-wine'
                                                        //   type='material-community'
                                                        //   color='red'
                                                        //   size={20}
                                                        //   iconStyle={image}
                                                        // />}
                                                        leftElement={<Image style={{width: 20, height: 20}}
                                                                            source={require("../images/wine-bottle.png")}/>}
                                                        title={'喝酒'}
                                                        rightTitle={this.getStatusParamString(item.drink, serverConfig.drinkData)}
                                                    /> :
                                                    <CusListItem
                                                        leftElement={<Image style={{width: 20, height: 20}}
                                                                            source={require("../images/wine-bottle.png")}/>}
                                                        title={'喝酒'}
                                                        rightTitle={'未填写'}
                                                    />
                                            }
                                            {
                                                item.baby != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='mother-nurse'
                                                    //   type='material-community'
                                                    //   color='pink'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/baby.png")}/>}
                                                    title={'想要小孩'}
                                                    rightTitle={this.getStatusParamString(item.baby, serverConfig.babyData)}
                                                /> : <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='mother-nurse'
                                                    //   type='material-community'
                                                    //   color='pink'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/baby.png")}/>}
                                                    title={'想要小孩'}
                                                    rightTitle={'未填写'}
                                                />
                                            }
                                        </View>
                                    </View>

                                    <View style={{marginTop: 20}}>
                                        <Text style={text}>Ta 择偶标准</Text>
                                        <Divider style={{backgroundColor: 'gray'}}/>
                                        <View style={{flex: 1, flexDirection: 'column'}}>
                                            {
                                                item.nsex != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='gender-male-female'
                                                    //   type='material-community'
                                                    //   color='#EE6A50'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/sex.png")}/>}
                                                    title={'性别'}
                                                    rightTitle={item.nsex === 0 ? '男' : '女'}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/sex.png")}/>}
                                                    title={'性别'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nbirthdate != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='cake-variant'
                                                    //   type='material-community'
                                                    //   color='#63B8FF'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/birthday-cake.png")}/>}
                                                    title={'最大年龄'}
                                                    rightTitle={item.nbirthdate}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/birthday-cake.png")}/>}
                                                    title={'最大年龄'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {this.getHeightSpan(item.nheight, item.nmaxheight)}
                                            {
                                                item.neducation != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='school'
                                                    //   type='material-community'
                                                    //   color='pink'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/books.png")}/>}
                                                    title={'学历'}
                                                    rightTitle={item.neducation}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/books.png")}/>}
                                                    title={'学历'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nlive != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='map-marker'
                                                    //   type='material-community'
                                                    //   color='#63B8FF'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/map-location.png")}/>}
                                                    title={'现居住地'}
                                                    rightTitle={item.nlive}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/map-location.png")}/>}
                                                    title={'现居住地'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nlanguage != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='google-translate'
                                                    //   type='material-community'
                                                    //   color='orange'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/translation.png")}/>}
                                                    title={'语言'}
                                                    rightTitle={item.nlanguage}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/translation.png")}/>}
                                                    title={'语言'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nbirthplace != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='home-map-marker'
                                                    //   type='material-community'
                                                    //   color='#AB82FF'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/placeholder.png")}/>}
                                                    title={'籍贯'}
                                                    rightTitle={item.nbirthplace}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/placeholder.png")}/>}
                                                    title={'籍贯'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.noccupation != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='briefcase'
                                                    //   type='material-community'
                                                    //   color='brown'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/meeting.png")}/>}
                                                    title={'职业'}
                                                    rightTitle={item.noccupation}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/meeting.png")}/>}
                                                    title={'职业'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nreligion != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='judaism'
                                                    //   type='material-community'
                                                    //   color='brown'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/jesus.png")}/>}
                                                    title={'宗教信仰'}
                                                    rightTitle={this.getStatusParamString(item.nreligion, serverConfig.religion)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/jesus.png")}/>}
                                                    title={'宗教信仰'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nincome != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='cash-usd'
                                                    //   type='material-community'
                                                    //   color='gold'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/income.png")}/>}
                                                    title={'月收入'}
                                                    rightTitle={this.getStatusParamString(item.nincome, serverConfig.inComeData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/income.png")}/>}
                                                    title={'月收入'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.ncar != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='car'
                                                    //   type='material-community'
                                                    //   color='#63B8FF'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/car.png")}/>}
                                                    title={'私家车'}
                                                    rightTitle={this.getStatusParamString(item.ncar, serverConfig.carData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/car.png")}/>}
                                                    title={'私家车'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nhouse != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='home-city-outline'
                                                    //   type='material-community'
                                                    //   color='orange'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/house.png")}/>}
                                                    title={'房产'}
                                                    rightTitle={this.getStatusParamString(item.nhouse, serverConfig.houseData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/house.png")}/>}
                                                    title={'房产'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nmarrystatus != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='account-supervisor-circle'
                                                    //   type='material-community'
                                                    //   color='#63B8FF'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/wedding-couple.png")}/>}
                                                    title={'婚姻状况'}
                                                    rightTitle={this.getStatusParamString(item.nmarrystatus, serverConfig.marryStatusData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/wedding-couple.png")}/>}
                                                    title={'婚姻状况'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nsmoke != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='smoking'
                                                    //   type='material-community'
                                                    //   color='black'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/smoking.png")}/>}
                                                    title={'抽烟'}
                                                    rightTitle={this.getStatusParamString(item.nsmoke, serverConfig.smokeData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/smoking.png")}/>}
                                                    title={'抽烟'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.ndrink != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='glass-wine'
                                                    //   type='material-community'
                                                    //   color='red'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/wine-bottle.png")}/>}
                                                    title={'喝酒'}
                                                    rightTitle={this.getStatusParamString(item.ndrink, serverConfig.drinkData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/wine-bottle.png")}/>}
                                                    title={'喝酒'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                            {
                                                item.nbaby != null ? <CusListItem
                                                    // leftIcon={<Icon
                                                    //   name='mother-nurse'
                                                    //   type='material-community'
                                                    //   color='pink'
                                                    //   size={20}
                                                    //   iconStyle={image}
                                                    // />}
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/baby.png")}/>}
                                                    title={'想要小孩'}
                                                    rightTitle={this.getStatusParamString(item.nbaby, serverConfig.babyData)}
                                                /> : <CusListItem
                                                    leftElement={<Image style={{width: 20, height: 20}}
                                                                        source={require("../images/baby.png")}/>}
                                                    title={'想要小孩'}
                                                    rightTitle={'未限制'}
                                                />
                                            }
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{height: 90, backgroundColor: 'white'}} />
                        </ScrollView>
                        <View style={styles.contentFindView}>
                            <TouchableOpacity activeOpacity={0.6}
                                              onPress={() => this._sayHi(item.id, item.name, lifephotos[0])}>
                                <View style={styles.loginBtn}>
                                    <Image style={{width: 30, height: 30, marginTop: 5, marginBottom: 5}}
                                           source={require("../images/sayhi.png")}/>
                                    <Text style={{color: "#FFFFFF", fontSize: 16, marginBottom: 5}}>打招呼</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this._favarite(item.id)}>
                                <View style={[styles.loginBtn, {backgroundColor: 'orange'}]}>
                                    <Image style={{width: 30, height: 30, marginTop: 5, marginBottom: 5}}
                                           source={require("../images/star.png")}/>
                                    <Text style={{
                                        color: "#ffffff",
                                        fontSize: 16,
                                        marginBottom: 5
                                    }}>{this.state.favorateBtnText}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this._matchMakerView(item.id)}>
                                <View style={[styles.loginBtn, {backgroundColor: 'lightcoral'}]}>
                                    <Image style={{width: 30, height: 30, marginTop: 5, marginBottom: 5}}
                                           source={require("../images/cupid.png")}/>
                                    <Text style={{color: "#ffffff", fontSize: 16, marginBottom: 5}}>红娘</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this.blackList(item.id)}>
                                <View style={[styles.loginBtn, {backgroundColor: 'silver'}]}>
                                    <Image style={{width: 30, height: 30, marginTop: 5, marginBottom: 5}}
                                           source={require("../images/blacklist.png")}/>
                                    <Text style={{
                                        color: "#ffffff",
                                        fontSize: 16,
                                        marginBottom: 5
                                    }}>{this.state.blackListBtn}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Provider>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
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
        width: width / 5,
        borderRadius: 3,
        backgroundColor: "#63B8FF",
        justifyContent: "center",
        alignItems: "center"
    }
});

export default withNavigationFocus(Index);
