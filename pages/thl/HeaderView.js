import React from 'react';
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import FastImage from "react-native-fast-image";
import {Toast} from "@ant-design/react-native";
import Utils from "../util/Utils";
import config from "../service/config";
import Swiper from 'react-native-swiper'

let {height, width} = Dimensions.get('window');
let url = config.host;

export default class HeaderView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            views: []
        };
    }

    navToView(viewName) {
        if (config.access_token === 'none') {
            this.props.nav.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.nav.navigate('EditWdIndex');
        } else {
            this.props.nav.navigate(viewName);
        }
    }

    render() {
        return (
            <View
                style={{flex: 1}}
            >
                {Utils.isEmpty(this.props.data) ? null :
                    <Swiper
                        showsPagination={true}
                        autoplay={true}
                        index={0}
                        // showsButtons
                        style={styles.wrapper}
                        // renderPagination={renderPagination}
                        height={270}
                        // dot={<View style={{
                        //     backgroundColor: 'rgba(255,255,255,.3)',
                        //     width: 7,
                        //     height: 7,
                        //     borderRadius: 7,
                        //     marginLeft: 7,
                        //     marginRight: 7
                        // }}/>}
                        activeDot={<View style={{
                            backgroundColor: 'pink',
                            width: 14,
                            height: 7,
                            borderRadius: 7,
                            marginLeft: 7,
                            marginRight: 7
                        }}/>}
                        paginationStyle={{
                            bottom: 70
                        }}
                    >
                        {this.props.data.map((item, index) => {
                            switch (item.datatype) {
                                case 0: {
                                    const img = url + JSON.parse(item.photo)[0];
                                    return <TouchableOpacity onPress={() => this.props.nav.navigate('ActivitiesAD', {
                                        type: item.type,
                                        url: item.url,
                                        id: item.id
                                    })}>
                                        <View style={styles.slide}>
                                            <FastImage
                                                source={{uri: img}}
                                                style={{
                                                    borderRadius: 15,
                                                    height: 200,
                                                    backgroundColor: '#F0F0F0'
                                                }}/>
                                            <View
                                                style={{
                                                    marginTop: 5,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                }}>
                                                <Text style={styles.name}>{item.title}</Text>
                                            </View>
                                            <View style={{
                                                marginTop: 5,
                                                flexDirection: 'row',
                                                alignItems: 'flex-start'
                                            }}>
                                                <View>
                                                    <Text style={styles.subTitle}>这是一条广告</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>;
                                }
                                case 1: {
                                    const img = url + '/uploadFile/party/' + JSON.parse(item.photos)[0];
                                    return <TouchableOpacity
                                        onPress={() => {
                                            this.props.nav.navigate('PartyCheckingView', {id: item.id})
                                        }}>
                                        <View style={styles.slide}>
                                            <FastImage
                                                source={{uri: img}}
                                                style={{
                                                    borderRadius: 15,
                                                    height: 200,
                                                    backgroundColor: '#F0F0F0'
                                                }}/>
                                            <View
                                                style={{
                                                    marginTop: 5,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                }}>
                                                <Text style={styles.name}>{item.title}</Text>
                                            </View>
                                            <View
                                                style={{marginTop: 5, flexDirection: 'row', alignItems: 'flex-start'}}>
                                                <View>
                                                    <Text style={styles.subTitle}>线下活动</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>;
                                }
                                case 2: {
                                    const img = url + JSON.parse(item.lifephoto)[0];
                                    return <TouchableOpacity
                                        onPress={() => this.props.nav.navigate('DetailIndex', {id: item.id})}>
                                        <View style={styles.slide}>
                                            <FastImage
                                                source={{uri: img}}
                                                style={{
                                                    borderRadius: 15,
                                                    height: 200,
                                                    backgroundColor: '#F0F0F0'
                                                }}/>
                                            <View
                                                style={{
                                                    marginTop: 5,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                }}>
                                                <Text style={styles.name}>{item.name}</Text>
                                            </View>
                                            <View
                                                style={{marginTop: 5, flexDirection: 'row', alignItems: 'flex-start'}}>
                                                <View>
                                                    <Text style={styles.subTitle}>用户推荐</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>;
                                }
                            }
                        })}
                    </Swiper>
                }
                {/*{Utils.isEmpty(this.props.photos) ? null : this.renderImages(this.props.photos)}*/}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 10,
                    marginLeft: 10,
                    marginRight: 10,
                    marginBottom: 10,
                    padding: 10
                }}>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => {
                        this.navToView('PartyListView');
                    }}>
                        <View style={[styles.loginBtn]}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../images/party.png")}/>
                            <Text style={{
                                color: "black",
                                fontSize: 12,
                                marginTop: 5
                            }}>参与活动</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => {
                        this.navToView('PublishPartyView');
                    }}>
                        <View style={[styles.loginBtn, {backgroundColor: 'tomato'}]}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../images/publish_party.png")}/>
                            <Text style={{
                                color: "black",
                                fontSize: 12,
                                marginTop: 5
                            }}>发布活动</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => {
                        this.navToView('MyPartyView');
                    }}>
                        <View style={[styles.loginBtn, {backgroundColor: 'mediumorchid'}]}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../images/jester.png")}/>
                            <Text style={{
                                color: "black",
                                fontSize: 12,
                                marginTop: 5
                            }}>我的活动</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => {
                        this.navToView('GrdtFb');
                    }}>
                        <View style={[styles.loginBtn, {backgroundColor: 'pink'}]}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../images/ins.png")}/>
                            <Text style={{
                                color: "black",
                                fontSize: 12,
                                marginTop: 5
                            }}>发布动态</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    loginBtn: {
        padding: 5,
        width: width / 5,
        borderRadius: 5,
        backgroundColor: "#63B8FF",
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        flex: 1
    },
    wrapper: {},
    slide: {
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 10
    },
    text: {
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold'
    },
    image: {
        width,
        flex: 1
    },
    paginationStyle: {
        position: 'absolute',
        bottom: 10,
        right: 10
    },
    paginationText: {
        color: 'black',
        fontSize: 20
    },
    name: {
        fontSize: 20,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    subTitle: {
        marginRight: 8,
        fontSize: 14,
        color: "#969696",
    }
});
