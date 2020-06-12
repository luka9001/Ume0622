import React, {Component} from 'react';
import {Icon} from 'react-native-elements';
import {View, ScrollView, StyleSheet, Dimensions, Image, TextInput, TouchableOpacity,SafeAreaView} from 'react-native';
import SYImagePicker from 'react-native-syan-image-picker';
import api from '../service/socialApi';
import {Toast, Provider} from '@ant-design/react-native';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from "../views/LoadingView";
import {ListItem, InputItem} from "../views/ItemView";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import GlobalStyles from "../styles/Styles";
import ImageResizer from "react-native-image-resizer";

let {width} = Dimensions.get('window');

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            photos: [],
            message: ''
        };
    }

    handleOpenImagePicker = () => {
        SYImagePicker.showImagePicker({
            imageCount: 9,
            isRecordSelected: true,
        }, (err, photos) => {
            if (!err) {
                this.resize(photos);
            } else {
                console.log(err);
                // alert('启动失败！请检查相册、相机权限！');
            }
        })
    };

     resize(photos) {
         let temp = [];
        photos.map(photo=>{
            ImageResizer.createResizedImage(photo.uri, 400, 300, 'JPEG', 20)
                .then(response => {
                    temp.push(response);
                    this.setState({
                        photos:temp
                    })
                })
                .catch(err => {
                    console.log(err);
                });
        });
    }

    submit = () => {
        if (this.state.message.trim() !== '') {
            const that = this;
            this.setState({
                loading: true
            });
            const params = {message: this.state.message.trim()};
            api.postMessage(params, this.state.photos).then(function (message) {
                if (message.code === '200') {
                    that.setState({
                        loading: false
                    });
                    Toast.info('发布成功', 1, undefined, false);
                    that.props.navigation.goBack();
                    that.props.navigation.state.params.callback();
                }
            }, function (error) {
                that.setState({
                    loading: false
                });
                Toast.info('网络错误，请检查后再尝试！');
            }).done();
        } else {
            Toast.info('未输入内容！');
        }
    };

    render() {
        const image = {
            width: 20,
            height: 20,
            marginRight: 5
        };
        const {photos} = this.state;
        return (
            <SafeAreaView
                forceInset={{vertical: 'never', top: 'always'}}
                style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        {this.state.loading ? (
                            <LoadingView
                                cancel={() => this.setState({loading: false})}
                            />
                        ) : null}
                        <CommonTitleBar
                            title={"动态发布"}
                            nav={this.props.navigation}
                            rightBtnText={'发布'}
                            handleRightBtnClick={() =>
                                this.submit()
                            }
                        />

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
                                <InputItem leftElement={<Icon
                                    name='account-heart'
                                    type='material-community'
                                    color='pink'
                                    size={20}
                                    iconStyle={image}
                                />} rightElement={<TextInput placeholder='这一刻的心语...(限100字)'
                                                             style={{
                                                                 fontSize: 20,
                                                                 flex: 1,
                                                                 borderRadius: 3,
                                                                 margin: 5,
                                                             }}
                                                             placeholderTextColor={'lightgray'}
                                                             selectionColor={GlobalStyles.inputSelectedColor}
                                                             maxLength={100}
                                                             multiline={true}
                                                             onChangeText={(text) => {
                                                                 this.setState({
                                                                     message: text
                                                                 });
                                                             }}/>}/>
                                <ListItem leftElement={<Icon
                                    name='image-size-select-actual'
                                    type='material-community'
                                    color='#63B8FF'
                                    size={20}
                                    iconStyle={image}
                                />}
                                          title={'相册'}
                                          // titleStyle={{fontSize: 20}}
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
                                                resizeMode={"contain"}
                                            />
                                        )
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
    contentFindView: {
        flex: 1,
        position: "absolute",
        bottom: 5,
        width: width,
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
});

export default Index;
