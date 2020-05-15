import React, {Component} from 'react';
import {Icon, CheckBox} from 'react-native-elements';
import {View, ScrollView, StyleSheet, Dimensions, Image, TextInput, Text, SafeAreaView} from 'react-native';
import SYImagePicker from 'react-native-syan-image-picker';
import {Toast, Provider, Modal, DatePicker} from '@ant-design/react-native';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from '../views/LoadingView';
import {ListItem, InputItem, SelectItem} from '../views/ItemView';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Global from '../util/Global';
import request from '../service/request';
import GlobalStyles from '../styles/Styles';
import moment from 'moment';
import Utils from '../util/Utils';
import config from '../service/config';
import SuccessView from '../views/SuccessView';

let {width} = Dimensions.get('window');

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            photos: [],
            title: '',
            text: '',
            checkedIndex: 1,
            total: 0,
            male: 0,
            female: 0,
            address: '',
            end_at: '活动开始日期',
            data: '',
            checkStatus: -1,
            success: false,
        };
    }

    componentDidMount(): void {
        if (!Utils.isEmpty(this.props.navigation.state.params)) {
            this.setState({
                loading: true,
            });
            this.init();
        }
    }

    init() {
        const that = this;
        request.get('v1/getparty/' + this.props.navigation.state.params.id).then(function (res) {
            let data = res;
            that.setState({
                data,
                loading: false,
                title: data.title,
                address: data.address,
                end_at: data.end_at,
                text: data.text,
                checkedIndex: data.type,
                total: data.total,
                male: data.male,
                female: data.female,
                checkStatus: data.check_status,
            });
            const _photos = JSON.parse(data.photos);
            let photos = [];
            _photos.map((data, index) => {
                const photo = {};
                photo.uri = config.host + '/uploadFile/party/' + data;
                photos.push(photo);
            });
            that.setState({
                photos,
            });
        }, function (error) {
            that.setState({
                loading: false,
            });
            that._alert('获取数据失败');
        }).done();
    }

    handleOpenImagePicker = () => {
        SYImagePicker.showImagePicker({
            imageCount: 9,
            quality: 20,
            compress: true,
        }, (err, photos) => {
            if (!err) {
                this.setState({
                    photos,
                });
            } else {
                console.log(err);
                // alert('启动失败！请检查相册、相机权限！');
            }
        });
    };

    _alert(content) {
        Modal.alert('提醒', content, [{text: '知道了'}]);
    }

    submit = () => {
        if (Utils.isEmpty(this.state.title.trim())) {
            this._alert('标题未填写');
        } else if (Utils.isEmpty(this.state.text.trim())) {
            this._alert('需填写活动描述');
        } else if (Utils.isEmpty(this.state.address)) {
            this._alert('活动具体地址未填写');
        } else if (this.state.end_at === '活动开始日期') {
            this._alert('活动开始日期未设置');
        } else if (this.state.photos.length === 0) {
            this._alert('至少上传一张图片');
        } else if (this.state.checkedIndex === 2 && parseInt(this.state.total) < 1) {
            this._alert('总人数不能为0');
        } else if (this.state.checkedIndex === 3 && this.countMaleAndFemale() < 1) {
            this._alert('总人数不能为0');
        } else {
            const that = this;
            this.setState({
                loading: true,
            });
            const params = {
                id: this.state.data.id,
                title: this.state.title.trim(),
                address: this.state.address.trim(),
                end_at: this.state.end_at,
                text: this.state.text.trim(),
                type: this.state.checkedIndex,
                total: this.state.total,
                male: this.state.male,
                female: this.state.female,
                check_status: this.state.checkStatus,
            };
            request.postWithPhotos('v1/publishparty', params, this.state.photos).then(function (message) {
                that.setState({
                    loading: false,
                    success: true,
                });
            }, function (error) {
                that.setState({
                    loading: false,
                });
                Modal.alert('失败', '网络错误,请检查后再次尝试', [{
                    text: '知道了',
                }]);
            }).done();
        }
    };

    countMaleAndFemale() {
        return parseInt(Utils.isEmpty(this.state.male) ? 0 : this.state.male) + parseInt(Utils.isEmpty(this.state.female) ? 0 : this.state.female);
    }

    checkStatusItem = () => {
        if (!Utils.isEmpty(this.state.data)) {
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
                                style={{
                                    fontSize: 15,
                                    textAlign: 'center',
                                    color: '#63B8FF',
                                    marginLeft: 10,
                                }}>正在等待审核</Text>
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
                            <Text
                                style={{fontSize: 15, textAlign: 'center', color: '#19AD17', marginLeft: 10}}>已审核</Text>
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
                            }}>原因:{this.state.data.check_detail}</Text>
                        </View>
                    );
                }
                default : {
                    return (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: width,
                        }}>
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
                                }}>请亲耐心等待审核结果，我们会在24小时内结束审核，之后发布的活动将可见\n</Text>
                        </View>
                    );
                }
            }
        }
    };

    onEndAtChange = (value) => {
        let _date = moment(value).format('YYYY-MM-DD');
        this.setState({end_at: _date});
    };

    render() {
        const image = {
            width: 20,
            height: 20,
            marginRight: 5,
        };
        const {photos} = this.state;
        return (
            <SafeAreaView
                forceInset={{vertical: 'never', top: 'always'}}
                style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        {
                            this.state.success ? (
                                <SuccessView text={'等待审核通过后将会发布'} ok={() => {
                                    this.setState({success: false});
                                    this.props.navigation.goBack();
                                }}
                                />
                            ) : null
                        }
                        {this.state.loading ? (
                            <LoadingView
                                cancel={() => this.setState({loading: false})}
                            />
                        ) : null}
                        <CommonTitleBar
                            title={'申请发布活动'}
                            nav={this.props.navigation}
                            rightBtnText={'发布'}
                            handleRightBtnClick={() =>
                                this.submit()
                            }
                        />
                        {this.checkStatusItem()}
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
                            <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
                                <InputItem leftElement={
                                    <Image style={{width: 20, height: 20}}
                                           source={require('../images/party.png')}/>
                                } rightElement={<TextInput placeholder='请输入活动标题...(限30字)'
                                                           style={{
                                                               fontSize: 20,
                                                               flex: 1,
                                                               borderRadius: 3,
                                                               margin: 5,
                                                           }}
                                                           placeholderTextColor={'lightgray'}
                                                           selectionColor={GlobalStyles.inputSelectedColor}
                                                           maxLength={30}
                                                           multiline={true}
                                                           value={this.state.title}
                                                           onChangeText={(text) => {
                                                               this.setState({
                                                                   title: text,
                                                               });
                                                           }}/>}/>
                                <InputItem leftElement={
                                    <Image style={{width: 20, height: 20}}
                                           source={require('../images/map-location.png')}/>
                                } rightElement={<TextInput placeholder='请输入地址'
                                                           style={{
                                                               fontSize: 20,
                                                               flex: 1,
                                                               borderRadius: 3,
                                                               margin: 5,
                                                           }}
                                                           maxLength={30}
                                                           multiline={true}
                                                           placeholderTextColor={'lightgray'}
                                                           selectionColor={GlobalStyles.inputSelectedColor}
                                                           value={this.state.address}
                                                           onChangeText={(text) => {
                                                               this.setState({
                                                                   address: text,
                                                               });
                                                           }}/>}/>
                                <DatePicker
                                    minDate={new Date(moment().format('YYYY-MM-DD'))}
                                    mode="date"
                                    onChange={this.onEndAtChange}
                                    format="YYYY-MM-DD"
                                >
                                    <SelectItem text={this.state.end_at}>
                                        <Image style={{width: 20, height: 20}}
                                               source={require('../images/time.png')}/>
                                    </SelectItem>
                                </DatePicker>
                                <InputItem leftElement={
                                    <Image style={{width: 20, height: 20}}
                                           source={require('../images/publish_party.png')}/>
                                } rightElement={<TextInput placeholder='请输入活动具体描述...(限200字)'
                                                           style={{
                                                               fontSize: 20,
                                                               flex: 1,
                                                               borderRadius: 3,
                                                               margin: 5,
                                                           }}
                                                           placeholderTextColor={'lightgray'}
                                                           selectionColor={GlobalStyles.inputSelectedColor}
                                                           maxLength={200}
                                                           multiline={true}
                                                           value={this.state.text}
                                                           onChangeText={(text) => {
                                                               this.setState({
                                                                   text: text,
                                                               });
                                                           }}/>}/>
                                <CheckBox
                                    title='不限制人数'
                                    checked={this.state.checkedIndex === 1}
                                    onPress={() => {
                                        this.setState({
                                            checkedIndex: 1,
                                        });
                                    }}
                                />
                                <CheckBox
                                    title='限制总人数'
                                    checked={this.state.checkedIndex === 2}
                                    onPress={() => {
                                        this.setState({
                                            checkedIndex: 2,
                                        });
                                    }}
                                />
                                {this.state.checkedIndex === 2 ?
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 10,
                                        marginRight: 10,
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        height: 40,
                                        borderWidth: 1,
                                        borderRadius: 3,
                                        borderColor: Global.pageBackgroundColor,
                                    }}>
                                        <Text style={{fontSize: 20}}>总人数:</Text>
                                        <TextInput
                                            defaultValue={this.state.total === 0 ? null : this.state.total.toString()}
                                            value={this.state.total}
                                            onChangeText={text => {
                                                this.setState({total: text});
                                            }}
                                            placeholder={'输入限制的总人数'}
                                            selectionColor={GlobalStyles.inputSelectedColor}
                                            style={{
                                                padding: 5,
                                                backgroundColor: Global.pageBackgroundColor,
                                                borderRadius: 10,
                                                flex: 1,
                                                fontSize: 20,
                                                borderWidth: 5,
                                                borderColor: 'white',
                                            }} keyboardType={'number-pad'}/>
                                    </View> : null}
                                <CheckBox
                                    title='按男女比例限制人数'
                                    checked={this.state.checkedIndex === 3}
                                    onPress={() => {
                                        this.setState({
                                            checkedIndex: 3,
                                        });
                                    }}
                                />
                                {this.state.checkedIndex === 3 ?
                                    <View style={{
                                        marginLeft: 10,
                                        marginRight: 10,
                                    }}>
                                        <View style={{
                                            paddingLeft: 10,
                                            paddingRight: 10,
                                            borderRadius: 3,
                                            borderWidth: 1,
                                            borderColor: Global.pageBackgroundColor,
                                            flexDirection: 'row', alignItems: 'center',
                                        }}><Text style={{fontSize: 20}}>总人数:</Text><Text
                                            style={{fontSize: 20}}>{this.countMaleAndFemale()}</Text></View>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: 40,
                                            borderRadius: 3,
                                            borderWidth: 1,
                                            borderColor: Global.pageBackgroundColor,
                                            marginTop: 5,
                                            paddingLeft: 10,
                                            paddingRight: 10,
                                        }}>
                                            <Text style={{fontSize: 20}}>男:</Text>
                                            <TextInput
                                                defaultValue={this.state.male === 0 ? null : this.state.male.toString()}
                                                value={this.state.male}
                                                onChangeText={text => {
                                                    this.setState({male: text});
                                                }}
                                                placeholder={'输入男性人数'}
                                                selectionColor={GlobalStyles.inputSelectedColor}
                                                style={{
                                                    padding: 5,
                                                    backgroundColor: Global.pageBackgroundColor,
                                                    borderRadius: 10,
                                                    flex: 1,
                                                    fontSize: 20,
                                                    borderWidth: 5,
                                                    borderColor: 'white',
                                                }} keyboardType={'number-pad'}/>
                                        </View>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: 40,
                                            borderRadius: 3,
                                            borderWidth: 1,
                                            borderColor: Global.pageBackgroundColor,
                                            marginTop: 5,
                                            paddingLeft: 10,
                                            paddingRight: 10,
                                        }}>
                                            <Text style={{fontSize: 20}}>女:</Text>
                                            <TextInput
                                                defaultValue={this.state.female === 0 ? null : this.state.female.toString()}
                                                value={this.state.female}
                                                onChangeText={text => {
                                                    this.setState({female: text});
                                                }}
                                                placeholder={'输入女性人数'}
                                                selectionColor={GlobalStyles.inputSelectedColor}
                                                style={{
                                                    padding: 5,
                                                    backgroundColor: Global.pageBackgroundColor,
                                                    borderRadius: 10,
                                                    flex: 1,
                                                    fontSize: 20,
                                                    borderWidth: 5,
                                                    borderColor: 'white',
                                                }} keyboardType={'number-pad'}/>
                                        </View>
                                    </View> : null}
                                <ListItem
                                    leftElement={<Icon
                                        name='image-size-select-actual'
                                        type='material-community'
                                        color='#63B8FF'
                                        size={20}
                                        iconStyle={image}
                                    />}
                                    title={'宣传图片'}
                                    subtitle={'最多上传九张照片'}
                                    bottomDivider={true}
                                    rightElement={<Icon raised
                                                        name='camera'
                                                        type='font-awesome'
                                                        color='gray'
                                                        onPress={this.handleOpenImagePicker}/>}/>

                                <ScrollView style={{flex: 1}} contentContainerStyle={styles.scroll}>
                                    {photos.map((photo, index) => {
                                        let source = {uri: photo.uri};
                                        if (photo.enableBase64) {
                                            source = {uri: photo.base64};
                                            console.log('base64!!!!!!!!!!!!!!!!!!!!');
                                        }
                                        return (
                                            <Image
                                                key={`image-${index}`}
                                                style={styles.image}
                                                source={source}
                                                resizeMode={'contain'}
                                            />
                                        );
                                    })}
                                </ScrollView>
                            </ScrollView>
                        </KeyboardAwareScrollView>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    pwdView: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
    },
    textInput: {
        textAlign: 'right',
        fontSize: 16,
    },
    pwdContainer: {
        flexDirection: 'row',
        // height: 50,
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
    contentFindView: {
        flex: 1,
        position: 'absolute',
        bottom: 5,
        width: width,
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
