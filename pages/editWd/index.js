import React, {Component} from 'react';
import moment from 'moment';

import {
    Image,
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
    ScrollView,
    Dimensions,
    AsyncStorage,
    TextInput,
    Platform,
    SafeAreaView,
} from 'react-native';
import {Button, Icon, ListItem} from 'react-native-elements';
import SYImagePicker from 'react-native-syan-image-picker';
import {DatePicker, TextareaItem, Picker, Toast, Modal, Provider, Pagination} from '@ant-design/react-native';
import api from '../service/personalInformationApi';
import serverConfig from '../service/config';

import find from 'lodash/find';

import cache from '../util/cache';

import StorageUtil from '../util/StorageUtil';
import DBHelper from '../util/DBHelper';
import MessageUserInfoUtil from '../util/MessageUserInfoUtil';
import Global from '../util/Global';
import CommonTitleBar from '../views/CommonTitleBar';
import Utils from '../util/Utils';
import LoadingView from '../views/LoadingView';

import {SelectItem, InputItem, ListItem as CusListItem} from '../views/ItemView';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GlobalStyles from '../styles/Styles';
import ImageResizer from 'react-native-image-resizer';
import LogUtil from '../util/LogUtil';

const {width} = Dimensions.get('window');

const heightData = [];
const sexData = [{label: '男', value: '男'}, {label: '女', value: '女'}];

const uniqueKey = 'label';
const displayKey = 'value';
const fontFamily = 'ProximaNova-Light';
const tagBorderColor = 'pink';
const tagTextColor = 'pink';

const locale = {
    prevText: '上一步',
    nextText: '下一步',
};

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            loading: false,
            photos: [],
            //注册资料
            realName: '',
            sex: ['性别'],
            birthDay: '出生日期',
            height: '身高',
            school: '学历',
            schoolStatus: false,
            live: '',
            birthplace: '',
            marryStatus: '婚姻状况',
            smoke: '抽烟吗？',
            smokeStatus: false,
            drink: '喝酒吗？',
            drinkStatus: false,
            baby: '是否想生小孩？',
            babyStatus: false,
            detail: '',
            income: '月收入',
            incomeStatus: false,
            car: '是否有车？',
            carStatus: false,
            house: '是否有房产？',
            houseStatus: false,
            occupation: '',
            language: '语言',
            languageData: [],
            religion: '宗教信仰',
            religionStatus: false,
            hobby: '',
            //对象的要求
            nsex: '性别',
            nsexStatus: false,
            nbirthDay: '最大年龄',
            nbirthDayStatus: false,
            nheight: '最低身高',
            nheightStatus: false,
            nMaxHeight: '最高身高',
            nMaxHeightStatus: false,
            nschool: '最低学历',
            nschoolStatus: false,
            nlive: '',
            nbirthplace: '',
            nmarryStatus: '婚姻状况',
            nmarryStatusStatus: false,
            nsmoke: '抽烟吗？',
            nsmokeStatus: false,
            ndrink: '喝酒吗？',
            ndrinkStatus: false,
            nbaby: '是否想生小孩？',
            nbabyStatus: false,
            nincome: '月收入',
            nincomeStatus: false,
            ncar: '是否有车？',
            ncarStatus: false,
            nhouse: '是否有房产？',
            nhouseStatus: false,
            noccupation: '',
            nlanguage: '语言',
            nlanguageData: [],
            nreligion: '宗教信仰',
            nreligionStatus: false,
            selectedItems: [],
            liveStatus: true,
            nliveStatus: true,
            birthplaceStatus: true,
            nbirthplaceStatus: true,
            occupationStatus: true,
            noccupationStatus: true,
            hobbyStatus: true,
            detailStatus: true,
            submmitText: '',
            languageStatus: true,
            nlanguageStatus: true,
            //审核状态
            check_status: true,
            check_detail: '',
            //分页
            page: 1,
            totalPage: 3,
        };

        //初始化身高信息
        for (let index = 130; index < 231; index++) {
            heightData.push({label: index, value: index});
        }
    }

    //清除语言选择本地缓存
    componentWillUnmount() {
        cache.language = [];
        cache.nlanguage = [];
    }

    /**
     * 暂留一个bug，断网时无法获取数据，则无法判断是否隐藏  上传按钮
     */
    componentDidMount() {
        if (serverConfig.state === '1') {
            let that = this;
            api.getUserInfo().then(function (data) {
                const _data = data.data;
                let submmitTag = 0;
                for (let key in _data) {
                    if (_data[key] === null) {
                        submmitTag = 1;
                    }
                }
                if (submmitTag === 0) {
                    that.setState({
                        submmitText: '申请修改资料',
                    });
                }
                that.setState({
                    check_status: _data.check_status,
                    check_detail: _data.check_detail,
                    visible: false,
                    sex: _data.sex === 0 ? '男' : '女',
                    birthDay: _data.birthdate,
                    height: _data.height,
                    live: _data.live,
                    birthplace: _data.birthplace,
                    marryStatus: serverConfig.marryStatusData[_data.marrystatus].value,
                    // languageStatus: false,
                    languageData: _data.language.split(','),

                    school: _data.education != null ? _data.education : that.state.school,
                    smoke: _data.smoke != null ? serverConfig.smokeData[_data.smoke].value : that.state.smoke,
                    drink: _data.drink != null ? serverConfig.drinkData[_data.drink].value : that.state.drink,
                    baby: _data.baby != null ? serverConfig.babyData[_data.baby].value : that.state.baby,
                    detail: _data.detail != null ? _data.detail : that.state.detail,
                    income: _data.income != null ? serverConfig.inComeData[_data.income].value : that.state.income,
                    car: _data.car != null ? serverConfig.carData[_data.car].value : that.state.car,
                    house: _data.house != null ? serverConfig.houseData[_data.house].value : that.state.house,
                    occupation: _data.occupation != null ? _data.occupation : that.state.occupation,
                    religion: _data.religion != null ? serverConfig.religion[_data.religion].value : that.state.religion,
                    hobby: _data.hobby != null ? _data.hobby : that.state.hobby,

                    nsex: that._setNSexState(_data.nsex),
                    nlanguageData: _data.nlanguage != null ? _data.nlanguage.split(',') : [],
                    nbirthDay: _data.nbirthdate != null ? _data.nbirthdate : that.state.nbirthDay,
                    nheight: _data.nheight != null ? _data.nheight : that.state.nheight,
                    nMaxHeight: _data.nmaxheight != null ? _data.nmaxheight : that.state.nMaxHeight,
                    nschool: _data.neducation != null ? _data.neducation : that.state.nschool,
                    nlive: _data.nlive != null ? _data.nlive : that.state.nlive,
                    nbirthplace: _data.nbirthplace != null ? _data.nbirthplace : that.state.nbirthplace,
                    nmarryStatus: _data.nmarrystatus != null ? serverConfig.marryStatusData[_data.nmarrystatus].value : that.state.nmarryStatus,
                    nsmoke: _data.nsmoke != null ? serverConfig.smokeData[_data.nsmoke].value : that.state.nsmoke,
                    ndrink: _data.ndrink != null ? serverConfig.drinkData[_data.ndrink].value : that.state.ndrink,
                    nbaby: _data.nbaby != null ? serverConfig.babyData[_data.nbaby].value : that.state.nbaby,
                    nincome: _data.nincome != null ? serverConfig.inComeData[_data.nincome].value : that.state.nincome,
                    ncar: _data.ncar != null ? serverConfig.carData[_data.ncar].value : that.state.ncar,
                    nhouse: _data.nhouse != null ? serverConfig.houseData[_data.nhouse].value : that.state.nhouse,
                    noccupation: _data.noccupation != null ? _data.noccupation : that.state.noccupation,
                    nreligion: _data.nreligion != null ? serverConfig.religion[_data.nreligion].value : that.state.nreligion,
                });

                // if (_data.education != null) {
                //   that.state.schoolStatus = true;
                // }

                // if (_data.neducation != null) {
                //   that.state.nschoolStatus = true;
                // }

                // if (_data.religion != null) {
                //   that.state.religionStatus = true;
                // }
                // if (_data.nreligion != null) {
                //   that.state.nreligionStatus = true;
                // }

                // if (_data.income != null) {
                //   that.state.incomeStatus = true;
                // }
                // if (_data.nincome != null) {
                //   that.state.nincomeStatus = true;
                // }

                // if (_data.car != null) {
                //   that.state.carStatus = true;
                // }

                // if (_data.ncar != null) {
                //   that.state.ncarStatus = true;
                // }

                // if (_data.house != null) {
                //   that.state.houseStatus = true;
                // }

                // if (_data.nhouse != null) {
                //   that.state.nhouseStatus = true;
                // }

                // if (_data.smoke != null) {
                //   that.state.smokeStatus = true;
                // }

                // if (_data.nsmoke != null) {
                //   that.state.nsmokeStatus = true;
                // }

                // if (_data.drink != null) {
                //   that.state.drinkStatus = true;
                // }

                // if (_data.ndrink != null) {
                //   that.state.ndrinkStatus = true;
                // }

                // if (_data.baby != null) {
                //   that.state.babyStatus = true;
                // }

                // if (_data.nbaby != null) {
                //   that.state.nbabyStatus = true;
                // }

                // if (_data.nsex != null) {
                //   that.state.nsexStatus = true;
                // }

                // if (_data.nbirthdate != null) {
                //   that.state.nbirthDayStatus = true;
                // }

                // if (_data.nheight != null) {
                //   that.state.nheightStatus = true;
                // }

                // if (_data.nmaxheight != null) {
                //   that.state.nMaxHeightStatus = true;
                // }

                // if (_data.nmarrystatus != null) {
                //   that.state.nmarryStatusStatus = true;
                // }

                // if (_data.live != null) {
                //   that.setState({
                //     liveStatus: false
                //   })
                // }

                // if (_data.nlive != null) {
                //   that.setState({
                //     nliveStatus: false
                //   });
                // }

                // if (_data.birthplace != null) {
                //   that.setState({
                //     birthplaceStatus: false
                //   });
                // }

                // if (_data.nbirthplace != null) {
                //   that.setState({
                //     nbirthplaceStatus: false
                //   });
                // }

                // if (_data.occupation != null) {
                //   that.setState({
                //     occupationStatus: false
                //   });
                // }

                // if (_data.noccupation != null) {
                //   that.setState({
                //     noccupationStatus: false
                //   });
                // }

                // if (_data.hobby != null) {
                //   that.setState({
                //     hobbyStatus: false
                //   });
                // }

                // if (_data.detail != null) {
                //   that.setState({
                //     detailStatus: false
                //   });
                // }

                cache.language = _data.language.split(',');
                that.setState({
                    languageData: _data.language.split(','),
                });
                if (_data.nlanguage != null) {
                    cache.nlanguage = _data.nlanguage.split(',');
                    that.setState({
                        nlanguageData: _data.nlanguage.split(','),
                    });

                    // that.setState({
                    //   nlanguageStatus: false
                    // });
                }
                const lifephotos = JSON.parse(_data.lifephoto);
                let photos = [];
                lifephotos.map((data, index) => {
                    const photo = {};
                    photo.uri = serverConfig.host + data;
                    photos.push(photo);
                });
                that.setState({
                    photos,
                });
            }, function (error) {

            }).done();
        } else {
            this.setState({
                visible: false,
            });
        }
    }

    _setNSexState(data) {
        if (data != null) {
            if (data === 0) {
                return '男';
            } else {
                return '女';
            }
        } else {
            return this.state.nsex;
        }
    }

    onSexChange = (value) => {
        this.setState({sex: value.toString()});
    };

    onNSexChange = (value) => {
        this.setState({nsex: value.toString()});
    };

    onBirthDateChange = (value) => {
        let _date = moment(value).format('YYYY-MM-DD');
        this.setState({birthDay: _date});
    };

    onNBirthDateChange = (value) => {
        let _date = moment(value).format('YYYY-MM-DD');
        this.setState({nbirthDay: _date});
    };

    onHeightChange = (value) => {
        this.setState({
            height: value.toString(),
        });
    };

    onNHeightChange = (value) => {
        this.setState({
            nheight: value.toString(),
        });
    };

    onNMaxHeightChange = (value) => {
        this.setState({
            nMaxHeight: value.toString(),
        });
    };

    onSchoolChange = (value) => {
        this.setState({
            school: value.toString(),
        });
    };

    onNSchoolChange = (value) => {
        this.setState({
            nschool: value.toString(),
        });
    };

    onMarryStatusChange = (value) => {
        this.setState({
            marryStatus: value.toString(),
        });
    };

    onNMarryStatusChange = (value) => {
        this.setState({
            nmarryStatus: value.toString(),
        });
    };

    onSmokeStatusChange = (value) => {
        this.setState({
            smoke: value.toString(),
        });
    };

    onNSmokeStatusChange = (value) => {
        this.setState({
            nsmoke: value.toString(),
        });
    };

    onDrinkStatusChange = (value) => {
        this.setState({
            drink: value.toString(),
        });
    };

    onNDrinkStatusChange = (value) => {
        this.setState({
            ndrink: value.toString(),
        });
    };

    onBabyStatusChange = (value) => {
        this.setState({
            baby: value.toString(),
        });
    };

    onNBabyStatusChange = (value) => {
        this.setState({
            nbaby: value.toString(),
        });
    };

    onInComeChange = (value) => {
        this.setState({
            income: value.toString(),
        });
    };

    onNInComeChange = (value) => {
        this.setState({
            nincome: value.toString(),
        });
    };

    onCarChange = (value) => {
        this.setState({
            car: value.toString(),
        });
    };

    onNCarChange = (value) => {
        this.setState({
            ncar: value.toString(),
        });
    };

    onHouseChange = (value) => {
        this.setState({
            house: value.toString(),
        });
    };

    onNHouseChange = (value) => {
        this.setState({
            nhouse: value.toString(),
        });
    };

    onLanguageChange = (value) => {
        this.setState({
            language: value.toString(),
        });
    };

    onNLanguageChange = (value) => {
        this.setState({
            nlanguage: value.toString(),
        });
    };

    onReligionChange = (value) => {
        this.setState({
            religion: value.toString(),
        });
    };

    onNReligionChange = (value) => {
        this.setState({
            nreligion: value.toString(),
        });
    };

    getStatusParam = (value, array) => {
        let _index = '';
        array.map((data, index) => {
            if (data.value === value) {
                _index = index;
            }
        });
        return _index;
    };

    handleOpenImagePicker = () => {
        if (this.state.photos.length >= 6) {
            Toast.info('最多只能选择六张照片');
        } else {
            SYImagePicker.showImagePicker({
                imageCount: 1,
                // isRecordSelected: true,
                isCrop: true,
                showCropCircle: false,
                CropW: 400,
                CropH: 300,
                // enableBase64: true
            }, (err, photos) => {
                if (!err && photos.length > 0) {
                    this.resize(photos[0].uri);
                } else {
                    console.log(err);
                    // alert('启动失败！请检查相册、相机权限！');
                }
            });
        }
    };

    resize(uri) {
        ImageResizer.createResizedImage(uri, 400, 300, 'JPEG', 20)
            .then(response => {
                let temp = this.state.photos;
                temp.push(response);
                this.setState({
                    photos: temp,
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    naviToMultiSelect = (id) => {
        this.props.navigation.navigate('MultiSelect', {
            id, dis: (id, items) => {
                this.disLanguageItem(id, items);
            },
        });
    };

    disLanguageItem(id, items) {
        if (id === 1) {
            this.setState({
                languageData: items,
            });
        } else {
            this.setState({
                nlanguageData: items,
            });
        }
    }

    submmit = () => {
        const params = {
            realname: this.state.realName,
            sex: this.state.sex,
            birthDay: this.state.birthDay,
            height: this.state.height,
            school: this.state.school === '学历' ? '' : this.state.school,
            live: this.state.live,
            birthplace: this.state.birthplace,
            smoke: this.getStatusParam(this.state.smoke, serverConfig.smokeData),
            drink: this.getStatusParam(this.state.drink, serverConfig.drinkData),
            baby: this.getStatusParam(this.state.baby, serverConfig.babyData),
            marryStatus: this.getStatusParam(this.state.marryStatus, serverConfig.marryStatusData),
            detail: this.state.detail,
            income: this.getStatusParam(this.state.income, serverConfig.inComeData),
            car: this.getStatusParam(this.state.car, serverConfig.carData),
            house: this.getStatusParam(this.state.house, serverConfig.houseData),
            language: this.state.languageData.toString(),
            occupation: this.state.occupation,
            religion: this.getStatusParam(this.state.religion, serverConfig.religion),
            hobby: this.state.hobby,
            //对象信息
            nsex: this.state.nsex === '性别' ? '' : this.state.nsex,
            nbirthDay: this.state.nbirthDay === '最大年龄' ? '' : this.state.nbirthDay,
            nheight: this.state.nheight === '最低身高' ? '' : this.state.nheight,
            nmaxheight: this.state.nMaxHeight === '最高身高' ? '' : this.state.nMaxHeight,
            nschool: this.state.nschool === '最低学历' ? '' : this.state.nschool,
            nlive: this.state.nlive,
            nbirthplace: this.state.nbirthplace,
            nsmoke: this.getStatusParam(this.state.nsmoke, serverConfig.smokeData),
            ndrink: this.getStatusParam(this.state.ndrink, serverConfig.drinkData),
            nbaby: this.getStatusParam(this.state.nbaby, serverConfig.babyData),
            nmarryStatus: this.getStatusParam(this.state.nmarryStatus, serverConfig.marryStatusData),
            nincome: this.getStatusParam(this.state.nincome, serverConfig.inComeData),
            ncar: this.getStatusParam(this.state.ncar, serverConfig.carData),
            nhouse: this.getStatusParam(this.state.nhouse, serverConfig.houseData),
            nlanguage: this.state.nlanguageData.toString(),
            noccupation: this.state.noccupation,
            nreligion: this.getStatusParam(this.state.nreligion, serverConfig.religion),
        };

        if (this.state.photos.length < 1) {
            Modal.alert('提醒', '至少上传一张照片', [{text: '我知道了'}]);
        }
            // else if (this.state.realName.trim() === '' || this.state.sex === '性别' || this.state.birthDay === '出生日期' ||
            //   this.state.height === '身高' || this.state.school === '学历' || this.state.live.trim() === ''
            //   || this.state.birthplace.trim() === ''
            //   || this.state.detail.trim() === '' || this.state.smoke === '抽烟吗？' || this.state.drink === '喝酒吗？' || this.state.baby === '是否想生小孩？'
            //   || this.state.marryStatus === '婚姻状况' || this.state.language === '语言' || this.state.occupation.trim() === ''
            //   || this.state.income === '月收入' || this.state.car === '是否有车？' || this.state.house === '是否有房产？' || this.state.religion === '宗教信仰' || this.state.hobby === ''
            //   || this.state.nsex === '性别' || this.state.nbirthDay === '出生日期' ||
            //   this.state.nheight === '最低身高' || this.state.nMaxHeight === '最高身高' || this.state.nschool === '学历' || this.state.nlive.trim() === ''
            //   || this.state.nbirthplace.trim() === '' || this.state.nlanguage === '语言' || this.state.noccupation.trim() === ''
            //   || this.state.nmarryStatus === '婚姻状况' || this.state.nsmoke === '抽烟吗？' || this.state.ndrink === '喝酒吗？' || this.state.nbaby === '是否想生小孩？'
            //   || this.state.nincome === '月收入' || this.state.ncar === '是否有车？' || this.state.nhouse === '是否有房产？' || this.state.nreligion === '宗教信仰') {
            //   Toast.info('请将信息填写完整！我们才能提供向您推荐更匹配的对象！');
        // }
        else if (this.state.sex === '性别' || this.state.birthDay === '出生日期' ||
            this.state.height === '身高' || this.state.live.trim() === ''
            || this.state.birthplace.trim() === ''
            || this.state.marryStatus === '婚姻状况' || this.state.languageData.length === 0) {
            Modal.alert('提醒', '必填信息需要填写完整', [{text: '我知道了'}]);
        } else {
            this.setState({
                loading: true,
            });
            this.setState({
                visible: true,
            });
            const that = this;
            api.postPI(params, this.state.photos).then(function (message) {
                that.setState({
                    loading: false,
                    visible: false,
                });
                if (message.code === '200') {
                    cache.language = [];
                    cache.nlanguage = [];
                    Toast.info('上传成功');
                    that.initUserInfo(message.data).then(r => {
                    });
                    StorageUtil.set('check_status', 0);
                } else if (message.code === '201') {
                    Modal.alert('未检测到照片文件', '请检查后再次尝试', [{text: '知道了'}]);
                } else {
                    Modal.alert('上传失败', '请检查后再次尝试', [{text: '知道了'}]);
                }
            }, function (error) {
                that.setState({
                    loading: false,
                    visible: false,
                });
                Modal.alert('上传超时!', '您的网络较为缓慢,请检查后再次尝试', [
                    {text: '知道了'},
                ]);
            }).done();
        }
    };

    async initUserInfo(userInfo) {
        //登陆之后判断是否填写注册资料
        serverConfig.name = userInfo.name.toString();
        serverConfig.lifephotos = JSON.parse(userInfo.lifephoto)[0].toString();
        serverConfig.state = userInfo.state.toString();
        serverConfig.sex = userInfo.sex;
        await AsyncStorage.setItem('name', userInfo.name.toString());
        await AsyncStorage.setItem('lifephotos', userInfo.lifephoto.toString());
        await AsyncStorage.setItem('state', userInfo.state.toString());
        StorageUtil.set('sex', userInfo.sex);
        this.props.navigation.goBack();
    }

    _findItem = itemKey => {
        const items = serverConfig.languageData;
        return find(items, singleItem => singleItem[uniqueKey] === itemKey) || {};
    };

    _displaySelectedItems = optionalSelctedItems => {
        const actualSelectedItems = optionalSelctedItems;
        return actualSelectedItems.map(singleSelectedItem => {
            const item = this._findItem(singleSelectedItem);
            if (!item[displayKey]) {
                return null;
            }
            return (
                <View
                    style={[
                        styles.selectedItem,
                        {
                            width: item[displayKey].length * 8 + 60,
                            justifyContent: 'center',
                            height: 40,
                            borderColor: tagBorderColor,
                        },
                    ]}
                    key={item[uniqueKey]}
                >
                    <Text
                        style={[
                            {
                                flex: 1,
                                color: tagTextColor,
                                fontSize: 15,
                            },
                            fontFamily ? {fontFamily} : {},
                        ]}
                        numberOfLines={1}
                    >
                        {item[displayKey]}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            this._removeItem(item);
                        }}
                    >
                    </TouchableOpacity>
                </View>
            );
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    getMaxTime() {
        return moment().subtract(18, 'years').format('YYYY-MM-DD');
    }

    delete(index) {
        let temp = this.state.photos;
        temp.splice(index, 1);
        this.setState({
            photos: temp,
        });
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
                                height: 25,
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
                                marginLeft: 10,
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
                                marginLeft: 10,
                            }}>请亲耐心等待审核结果，我们会在24小时内结束审核，之后即可开启功能\n</Text>
                    </View>
                );
            }
        }
    };

    render() {
        const {photos} = this.state;
        return (
            <SafeAreaView
                forceInset={{vertical: 'never', top: 'always'}}
                style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1}}>
                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}
                        <CommonTitleBar title={'完善个人信息'} nav={this.props.navigation} rightBtnText={'完成'}
                                        handleRightBtnClick={() =>
                                            Modal.alert('提醒', '确人要上传资料吗', [
                                                {text: '上传', onPress: () => this.submmit()}, {text: '取消'},
                                            ])
                                        }/>
                        {this.checkStatusItem()}
                        <ScrollView ref={(pagination) => this.pagination = pagination} pagingEnabled={true}
                                    horizontal={true} scrollEnabled={false}>

                            <KeyboardAwareScrollView
                                style={{width: width}}
                                //{...scrollPersistTaps}
                                // style={this.state.page1 ? null : {display: 'none'}}
                                contentContainerStyle={{flex: 1}}
                                // scrollEnabled={scrollEnabled}
                                alwaysBounceVertical={false}
                                keyboardVerticalOffset={128}
                                // extraHeight={keyboardVerticalOffset}
                                behavior='position'
                            >
                                <ScrollView>
                                    <ListItem
                                        // leftIcon={<Icon
                                        //   name='image-size-select-actual'
                                        //   type='material-community'
                                        //   color='#63B8FF'
                                        //   size={20}
                                        //   iconStyle={image}
                                        // />}
                                        leftElement={<Image style={{width: 20, height: 20}}
                                                            source={require('../images/image.png')}/>}
                                        title={'请上传真实生活照'}
                                        subtitle={'最少一张,最多六张'}
                                        bottomDivider={true}
                                        // onPress={this.grdt}
                                        rightIcon={
                                            <Icon raised
                                                  name='camera'
                                                  type='font-awesome'
                                                  color='gray'
                                                  onPress={this.handleOpenImagePicker}/>
                                        }
                                    />
                                    <ScrollView style={{flex: 1}} contentContainerStyle={styles.scroll}>
                                        {photos.map((photo, index) => {
                                            let source = {uri: photo.uri};
                                            if (photo.enableBase64) {
                                                source = {uri: photo.base64};
                                                console.log('base64!!!!!!!!!!!!!!!!!!!!');
                                            }
                                            return (
                                                <View>
                                                    <Image
                                                        key={`image-${index}`}
                                                        style={styles.image}
                                                        source={source}
                                                        resizeMode={'contain'}
                                                    />
                                                    <TouchableOpacity style={styles.contentFindView} onPress={() => {
                                                        this.delete(index);
                                                    }}>
                                                        <Image style={{width: 30, height: 30}}
                                                               source={require('../images/error.png')}/>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                    <ListItem
                                        title="基础信息(必填)"
                                        // subtitle="必填项(非必填项全部完成后获得心动币，可换取一次红娘功能)"
                                        titleStyle={{color: '#EE6A50'}}
                                        subtitleStyle={{color: '#EE6A50'}}
                                    />
                                    <Picker
                                        data={sexData}
                                        cols={1}
                                        value={this.state.sex}
                                        onChange={this.onSexChange}
                                        // disabled={serverConfig.state === '1' ? true : false}
                                    >
                                        <SelectItem text={this.state.sex}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/sex.png')}/>
                                        </SelectItem>
                                    </Picker>

                                    <DatePicker
                                        // value={this.state.birthDay}
                                        mode="date"
                                        minDate={new Date(1960, 1, 1)}
                                        maxDate={new Date(this.getMaxTime())}
                                        onChange={this.onBirthDateChange}
                                        format="YYYY-MM-DD"
                                        // disabled={this.state.birthDay === '出生日期' ? false : true}
                                    >
                                        <SelectItem text={this.state.birthDay}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/birthday-cake.png')}/>
                                        </SelectItem>
                                    </DatePicker>

                                    <Picker
                                        data={heightData}
                                        value={[172]}
                                        cols={1}
                                        onChange={this.onHeightChange}
                                        // disabled={this.state.height === '身高' ? false : true}
                                    >
                                        <SelectItem text={this.state.height}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/height.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <InputItem leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/map-location.png')}/>}
                                               rightElement={<TextInput
                                                   placeholderTextColor={'lightgray'}
                                                   selectionColor={GlobalStyles.inputSelectedColor}
                                                   maxLength={10}
                                                   editable={this.state.liveStatus}
                                                   value={this.state.live}
                                                   onChangeText={text => {
                                                       this.setState({live: text});
                                                   }}
                                                   placeholder='现居住地(城市名,不超过10字)'
                                                   style={styles.textInput}
                                                   underlineColorAndroid="transparent"
                                               />}/>
                                    <InputItem onPress={() => {
                                        if (this.state.languageStatus) {
                                            this.naviToMultiSelect(1);
                                        }
                                    }}
                                               leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/translation.png')}/>}
                                               rightElement={<Text
                                                   style={styles.textInput}>{this.state.languageData.length === 0 ? '请选择语言能力' : '修改语言能力'}</Text>}/>

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            backgroundColor: 'white',
                                        }}
                                    >
                                        {this._displaySelectedItems(this.state.languageData)}
                                    </View>
                                    <InputItem leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/placeholder.png')}/>}
                                               rightElement={<TextInput
                                                   placeholderTextColor={'lightgray'}
                                                   selectionColor={GlobalStyles.inputSelectedColor}
                                                   maxLength={10}
                                                   placeholder='籍贯(城市名,不超过10字)'
                                                   value={this.state.birthplace}
                                                   editable={this.state.birthplaceStatus}
                                                   onChangeText={(text) => {
                                                       this.setState({
                                                           birthplace: text,
                                                       });
                                                   }}
                                                   style={styles.textInput}
                                                   underlineColorAndroid="transparent"
                                               />}/>

                                    <Picker
                                        data={serverConfig.marryStatusData}
                                        cols={1}
                                        onChange={this.onMarryStatusChange}
                                        // disabled={this.state.marryStatus === '婚姻状况' ? false : true}
                                    >
                                        <SelectItem text={this.state.marryStatus}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/wedding-couple.png')}/>
                                        </SelectItem>
                                    </Picker>
                                </ScrollView>
                            </KeyboardAwareScrollView>
                            <KeyboardAwareScrollView
                                style={{width: width}}
                                // style={this.state.page2 ? null : {display: 'none'}}
                                contentContainerStyle={{flex: 1}}
                                alwaysBounceVertical={false}
                                keyboardVerticalOffset={128}
                                behavior='position'
                            >
                                <ScrollView>
                                    <ListItem
                                        title="关于我(选填)"
                                        // subtitle="(非必填项,若完成可获得心动币)"
                                        titleStyle={{color: '#63B8FF'}}
                                        subtitleStyle={{color: '#63B8FF'}}
                                    />
                                    <InputItem leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/meeting.png')}/>}
                                               rightElement={<TextInput
                                                   placeholderTextColor={'lightgray'}
                                                   selectionColor={GlobalStyles.inputSelectedColor}
                                                   maxLength={10}
                                                   placeholder='我的职业(不超过10字)'
                                                   value={this.state.occupation}
                                                   editable={this.state.occupationStatus}
                                                   onChangeText={(text) => {
                                                       this.setState({
                                                           occupation: text,
                                                       });
                                                   }}
                                                   style={styles.textInput}
                                                   underlineColorAndroid="transparent"
                                               />}/>
                                    <Picker
                                        data={serverConfig.schoolData}
                                        cols={1}
                                        onChange={this.onSchoolChange}
                                        disabled={this.state.schoolStatus}
                                    >
                                        <SelectItem text={this.state.school}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/books.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <InputItem leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/jigsaw.png')}/>}
                                               rightElement={<TextInput
                                                   placeholderTextColor={'lightgray'}
                                                   selectionColor={GlobalStyles.inputSelectedColor}
                                                   maxLength={10}
                                                   containerStyle={{backgroundColor: 'white'}}
                                                   placeholder='兴趣爱好(不超过10字)'
                                                   value={this.state.hobby}
                                                   editable={this.state.hobbyStatus}
                                                   onChangeText={(text) => {
                                                       this.setState({
                                                           hobby: text,
                                                       });
                                                   }}
                                                   style={styles.textInput}
                                                   underlineColorAndroid="transparent"
                                               />}/>

                                    <Picker
                                        data={serverConfig.religion}
                                        cols={1}
                                        onChange={this.onReligionChange}
                                        disabled={this.state.religionStatus}
                                    >
                                        <SelectItem text={this.state.religion}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/jesus.png')}/>
                                        </SelectItem>
                                    </Picker>

                                    <Picker
                                        data={serverConfig.inComeData}
                                        cols={1}
                                        onChange={this.onInComeChange}
                                        disabled={this.state.incomeStatus}
                                    >
                                        <SelectItem text={this.state.income}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/income.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.carData}
                                        cols={1}
                                        onChange={this.onCarChange}
                                        disabled={this.state.carStatus}
                                    >
                                        <SelectItem text={this.state.car}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/car.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.houseData}
                                        cols={1}
                                        onChange={this.onHouseChange}
                                        disabled={this.state.houseStatus}
                                    >
                                        <SelectItem text={this.state.house}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/house.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.smokeData}
                                        cols={1}
                                        onChange={this.onSmokeStatusChange}
                                        disabled={this.state.smokeStatus}
                                    >
                                        <SelectItem text={this.state.smoke}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/smoking.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.drinkData}
                                        cols={1}
                                        onChange={this.onDrinkStatusChange}
                                        disabled={this.state.drinkStatus}
                                    >
                                        <SelectItem text={this.state.drink}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/wine-bottle.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.babyData}
                                        cols={1}
                                        onChange={this.onBabyStatusChange}
                                        disabled={this.state.babyStatus}
                                    >
                                        <SelectItem text={this.state.baby}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/baby.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <ListItem
                                        // leftIcon={<Icon
                                        //   name='file-outline'
                                        //   type='material-community'
                                        //   color='gold'
                                        //   size={20}
                                        //   iconStyle={image}
                                        // />}
                                        leftElement={<Image style={{width: 20, height: 20}}
                                                            source={require('../images/resume.png')}/>}
                                        title={'个人介绍'}
                                        bottomDivider={true}
                                    />
                                    <TextareaItem placeholder="请简短的介绍一下自己,不超过100字" editable={this.state.detailStatus}
                                                  row={4}
                                                  autoHeight style={{margin: 10}} value={this.state.detail}
                                                  onChange={(text) => this.setState({detail: text})} count={100}/>
                                </ScrollView>
                            </KeyboardAwareScrollView>
                            <KeyboardAwareScrollView
                                style={{width: width}}
                                // style={this.state.page3 ? null : {display: 'none'}}
                                contentContainerStyle={{flex: 1}}
                                alwaysBounceVertical={false}
                                keyboardVerticalOffset={128}
                                behavior='position'
                            >
                                <ScrollView>
                                    <ListItem
                                        title="择偶标准(选填)"
                                        // subtitle="(非必填项,若完成可获得心动币)"
                                        titleStyle={{color: '#63B8FF'}}
                                        subtitleStyle={{color: '#63B8FF'}}
                                    />
                                    <Picker
                                        data={sexData}
                                        cols={1}
                                        onChange={this.onNSexChange}
                                        disabled={this.state.nsexStatus}
                                    >
                                        <SelectItem text={this.state.nsex}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/sex.png')}/>
                                        </SelectItem>
                                    </Picker>

                                    <DatePicker
                                        // value={this.state.birthDay}
                                        mode="date"
                                        minDate={new Date(1960, 1, 1)}
                                        maxDate={new Date(this.getMaxTime())}
                                        onChange={this.onNBirthDateChange}
                                        format="YYYY-MM-DD"
                                        disabled={this.state.nbirthDayStatus}
                                    >
                                        <SelectItem text={this.state.nbirthDay}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/birthday-cake.png')}/>
                                        </SelectItem>
                                    </DatePicker>
                                    <Picker
                                        data={heightData}
                                        value={[160]}
                                        cols={1}
                                        onChange={this.onNHeightChange}
                                        disabled={this.state.nheightStatus}
                                    >
                                        <SelectItem text={this.state.nheight}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/height.png')}/>
                                        </SelectItem>
                                    </Picker>

                                    <Picker
                                        data={heightData}
                                        value={[180]}
                                        cols={1}
                                        onChange={this.onNMaxHeightChange}
                                        disabled={this.state.nMaxHeightStatus}
                                    >
                                        <SelectItem text={this.state.nMaxHeight}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/height.png')}/>
                                        </SelectItem>
                                    </Picker>

                                    <InputItem leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/map-location.png')}/>}
                                               rightElement={
                                                   <TextInput
                                                       placeholderTextColor={'lightgray'}
                                                       selectionColor={GlobalStyles.inputSelectedColor}
                                                       maxLength={10}
                                                       placeholder='现居住地(城市名,不超过10字)'
                                                       value={this.state.nlive}
                                                       editable={this.state.nliveStatus}
                                                       onChangeText={(text) => {
                                                           this.setState({
                                                               nlive: text,
                                                           });
                                                       }}
                                                       style={styles.textInput}
                                                       underlineColorAndroid="transparent"
                                                   />
                                               }/>
                                    <InputItem onPress={() => {
                                        if (this.state.nlanguageStatus) {
                                            this.naviToMultiSelect(2);
                                        }
                                    }}
                                               leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/translation.png')}/>}
                                               rightElement={<Text
                                                   style={styles.textInput}>{this.state.nlanguageData.length === 0 ? '选择对方的语言能力' : '修改对方的语言能力'}</Text>}/>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            backgroundColor: 'white',
                                        }}
                                    >
                                        {/* {this._displaySelectedItems(this.props.counter.nlanguage)} */}
                                        {this._displaySelectedItems(this.state.nlanguageData)}
                                    </View>
                                    <InputItem leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/placeholder.png')}/>}
                                               rightElement={<TextInput
                                                   placeholderTextColor={'lightgray'}
                                                   selectionColor={GlobalStyles.inputSelectedColor}
                                                   maxLength={10}
                                                   placeholder='籍贯(城市名,不超过10字)'
                                                   value={this.state.nbirthplace}
                                                   editable={this.state.nbirthplaceStatus}
                                                   onChangeText={(text) => {
                                                       this.setState({
                                                           nbirthplace: text,
                                                       });
                                                   }}
                                                   style={styles.textInput}
                                                   underlineColorAndroid="transparent"
                                               />}/>
                                    <InputItem leftElement={<Image style={{width: 20, height: 20}}
                                                                   source={require('../images/meeting.png')}/>}
                                               rightElement={<TextInput
                                                   placeholderTextColor={'lightgray'}
                                                   selectionColor={GlobalStyles.inputSelectedColor}
                                                   maxLength={10}
                                                   placeholder='职业要求(不超过10字)'
                                                   value={this.state.noccupation}
                                                   editable={this.state.noccupationStatus}
                                                   onChangeText={(text) => {
                                                       this.setState({
                                                           noccupation: text,
                                                       });
                                                   }}
                                                   style={styles.textInput}
                                                   underlineColorAndroid="transparent"
                                               />}/>
                                    <Picker
                                        data={serverConfig.schoolData}
                                        cols={1}
                                        onChange={this.onNSchoolChange}
                                        disabled={this.state.nschoolStatus}
                                    >
                                        <SelectItem text={this.state.nschool}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/books.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.religion}
                                        cols={1}
                                        onChange={this.onNReligionChange}
                                        disabled={this.state.nreligionStatus}
                                    >
                                        <SelectItem text={this.state.nreligion}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/jesus.png')}/>
                                        </SelectItem>
                                    </Picker>

                                    <Picker
                                        data={serverConfig.inComeData}
                                        cols={1}
                                        onChange={this.onNInComeChange}
                                        disabled={this.state.nincomeStatus}
                                    >
                                        <SelectItem text={this.state.nincome}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/income.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.carData}
                                        cols={1}
                                        onChange={this.onNCarChange}
                                        disabled={this.state.ncarStatus}
                                    >
                                        <SelectItem text={this.state.ncar}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/car.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.houseData}
                                        cols={1}
                                        onChange={this.onNHouseChange}
                                        disabled={this.state.nhouseStatus}
                                    >
                                        <SelectItem text={this.state.nhouse}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/house.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.marryStatusData}
                                        cols={1}
                                        onChange={this.onNMarryStatusChange}
                                        disabled={this.state.nmarryStatusStatus}
                                    >
                                        <SelectItem text={this.state.nmarryStatus}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/wedding-couple.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.smokeData}
                                        cols={1}
                                        onChange={this.onNSmokeStatusChange}
                                        disabled={this.state.nsmokeStatus}
                                    >
                                        <SelectItem text={this.state.nsmoke}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/smoking.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.drinkData}
                                        cols={1}
                                        onChange={this.onNDrinkStatusChange}
                                        disabled={this.state.ndrinkStatus}
                                    >
                                        <SelectItem text={this.state.ndrink}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/wine-bottle.png')}/>
                                        </SelectItem>
                                    </Picker>
                                    <Picker
                                        data={serverConfig.babyData}
                                        cols={1}
                                        onChange={this.onNBabyStatusChange}
                                        disabled={this.state.nbabyStatus}
                                    >
                                        <SelectItem text={this.state.nbaby}>
                                            <Image style={{width: 20, height: 20}}
                                                   source={require('../images/baby.png')}/>
                                        </SelectItem>
                                    </Picker>

                                    {/* {
            this.state.submmitText != '申请修改资料' ? <Button
              icon={<Icon
                name='arrow-up-bold'
                type='material-community'
                color='white'
                size={20}
              />}
              title="完成"
              type="solid"
              loading={this.state.loading}
              onPress={() => this.submmit()}
              raised={true}
              buttonStyle={{ height: 45, backgroundColor: '#63B8FF', borderRadius: 15 }}
              containerStyle={{ margin: 20, borderRadius: 15 }}
            /> : null
          } */}
                                </ScrollView>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        <View style={{
                            height: 1,
                            backgroundColor: Global.pageBackgroundColor,
                            width: width,
                        }}/>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 10,
                                width: width,
                            }}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this.lastPage()}>
                                <View
                                    style={[styles.pageBtn, this.state.page === 1 ? {backgroundColor: Global.pageBackgroundColor} : {backgroundColor: 'white'}]}>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: 16,
                                        marginLeft: 0,
                                    }}>上一页</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{color: 'grey'}}>
                                    <Text style={styles.paginationText}>{this.state.page}</Text>/{this.state.totalPage}
                                    <Text>{this.state.page === 1 ? '必填' : '选填'}</Text>
                                </Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this.nextPage()}>
                                <View
                                    style={[styles.pageBtn, this.state.page === this.state.totalPage ? {backgroundColor: Global.pageBackgroundColor} : {backgroundColor: 'white'}]}>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: 16,
                                        marginRight: 0,
                                    }}>下一页</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }

    lastPage() {
        if (this.state.page !== 1) {
            let currentPage = this.state.page;
            this.setState({
                page: --currentPage,
            });
            let currentWidth = currentPage * width;
            this.pagination.scrollTo({x: currentWidth - width, y: 0, animated: true});
        }
    }

    nextPage() {
        if (this.state.page !== this.state.totalPage) {
            let currentPage = this.state.page;
            this.pagination.scrollTo({x: width * currentPage, y: 0, animated: true});
            this.setState({
                page: ++currentPage,
            });
        }
    }
}

const styles = StyleSheet.create({
    paginationText: {
        color: 'black',
        fontSize: 20,
    },
    pageBtn: {
        height: 50,
        width: width / 5,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: Global.pageBackgroundColor,
        backgroundColor: '#63B8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapper: {},
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
        textAlign: 'right',
        fontSize: 16,
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
        marginLeft: 20,
        marginRight: 20,
    },
    pwdDivider: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
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
    changeAccount: {
        fontSize: 16,
        color: '#00BC0C',
        textAlign: 'center',
        marginBottom: 20,
    },
    contentFindView: {
        flex: 1,
        // width: width,
        position: 'absolute',
        top: 1,
        right: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingTop: 3,
        paddingRight: 3,
        paddingBottom: 3,
        margin: 3,
        borderRadius: 20,
        borderWidth: 2,
    },
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        paddingTop: 40,
    },
    btn: {
        backgroundColor: '#FDA549',
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 12,
        margin: 5,
        borderRadius: 22,
    },
    scroll: {
        padding: 5,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    image: {
        margin: 10,
        width: (width - 80) / 3,
        height: (width - 80) / 3,
        backgroundColor: '#F0F0F0',
    },
});

export default Index;
