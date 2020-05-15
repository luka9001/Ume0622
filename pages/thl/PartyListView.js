import React from 'react';
import CommonTitleBar from "../views/CommonTitleBar";
import {ActivityIndicator, FlatList, Image, PixelRatio, StyleSheet, Text, TouchableOpacity, View,SafeAreaView} from "react-native";
import FastImage from "react-native-fast-image";
import VipLevelView from "../views/VipLevelView";
import {Icon} from "react-native-elements";
import {Toast} from "@ant-design/react-native";
import request from "../service/request";
import config from "../service/config";
import Global from "../util/Global";
import {SelectItem} from "../views/ItemView";

export default class PartyListView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            infoList: [],
            loading: true,
            isLoadMore: false
        }
    }

    componentDidMount() {
        this.getData();
    }

    _keyExtractor = (item, index) => "list-item-" + index;

    _refresh() {
        this.setState({loading: true});
        this.getData();
    };

    getData = () => {
        this.page = 1;
        const that = this;
        request.get('v1/getpartylist?page=' + this.page).then(function (message) {
            const _list = message.data;
            let isLoadMore = false;
            if (_list.length === 10) {
                isLoadMore = true;
            }

            const _loadMoreText = isLoadMore === true ? '正在加载更多...' : '没有了';
            that.setState({
                loadMoreText: _loadMoreText,
                isLoadMore,
                infoList: _list,
                loading: false
            });

        }, function (error) {
            that.setState({
                loading: false
            });
            Toast.info('网络错误！请检查后再次尝试！');
        }).done();
    };

    _rowRenderer = ({item, index, separators}) => {
        const url = config.host + '/uploadFile/party/';
        let photos = JSON.parse(item.photos);
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.navigate('PartyCheckingView', {id: item.id});
                }}>
                    <View style={{backgroundColor: '#FFFFFF'}}
                    >
                        <View
                            style={{
                                marginTop: 10,
                                height: 30,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>
                            {/*<Image style={{width: 20, height: 20}}*/}
                            {/*       source={require("../images/party.png")}/>*/}
                            <Text style={styles.name}>{item.title}</Text>
                            {/* <Icon
                    name='dots-vertical'
                    type='material-community'
                    size={20}
                  /> */}
                        </View>
                        <View>
                            {
                                photos.length > 0 ? <FastImage
                                    source={{uri: url + photos[0]}}
                                    style={{
                                        width: '100%',
                                        height: 300,
                                        marginTop: 5
                                    }}/> : <FastImage
                                    style={{width: '100%', height: 300, marginTop: 5}}/>
                            }
                        </View>
                        <View style={{marginTop: 8, flexDirection: 'row', alignItems: 'center'}}>
                            <Image style={{width: 20, height: 20, marginRight: 10}}
                                   source={require("../images/pin-outline.png")}/>
                            <View style={{flex: 3}}>
                                <Text style={styles.text}>地址:</Text>
                            </View>
                            <View style={{flex: 12}}>
                                <Text style={styles.text}>{item.address}</Text>
                            </View>
                        </View>
                        <View style={{marginTop: 8, flexDirection: 'row', alignItems: 'center'}}>
                            <Image style={{width: 20, height: 20, marginRight: 10}}
                                   source={require("../images/clock-outline.png")}/>
                            <View style={{flex: 3}}>
                                <Text style={styles.text}>开始日期:</Text>
                            </View>
                            <View style={{flex: 12}}>
                                <Text style={styles.text}>{item.end_at}</Text>
                            </View>
                        </View>
                        {/*<View style={{marginTop: 8, flexDirection: 'row', alignItems: 'center'}}>*/}
                        {/*    <View>*/}
                        {/*        <FastImage style={{width: 20, height: 20, borderRadius: 5}}*/}
                        {/*                   source={{*/}
                        {/*                       uri: config.host + '/api/v1/avatar/' + item.uid,*/}
                        {/*                   }}/>*/}
                        {/*    </View>*/}
                        {/*</View>*/}
                    </View>
                </TouchableOpacity>
                <View style={styles.divider}/>
            </View>
        );
    };

    _renderFooter = () => {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                // backgroundColor: 'white',
                marginBottom: 5
            }}>
                {this.state.isLoadMore === true ? <ActivityIndicator size="small" color="#63B8FF"/> : null}
                <View style={{alignItems: 'center'}}>
                    <Text>{this.state.loadMoreText}</Text>
                </View>
            </View>
        )
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this.getMoreData();
    };

    getMoreData = () => {
        this.page = this.page + 1;
        const that = this;
        request.get('v1/getpartylist?page=' + this.page).then(function (message) {
            let isLoadMore = false;
            let _list = message.data;
            if (_list.length === 10) {
                isLoadMore = true;
            }

            that.setState({
                loadMoreText: isLoadMore === true ? that.state.loadMoreText : '没有了',
                isLoadMore,
                infoList: that.state.infoList.concat(_list)
            });
            if (!isLoadMore) {
                Toast.info('没有了', 1, undefined, false);
            } else {
                // Toast.info('正在加载更多...', 1, undefined, false);
            }
        }, function (error) {
            that.setState({
                isLoadMore: true
            });
            Toast.info('网络错误！请检查后再次尝试！');
        }).done();
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <CommonTitleBar
                    title={"线下活动"}
                    nav={this.props.navigation}
                    // callback={this.props.navigation.state.params.callback !== null ? this.props.navigation.state.params.callback : null}
                />
                <FlatList
                    style={[styles.fill]}
                    data={this.state.infoList}
                    renderItem={this._rowRenderer}
                    keyExtractor={this._keyExtractor}
                    extraData={this.state}
                    onEndReached={this._onLoadMore}
                    onEndReachedThreshold={1}
                    ListFooterComponent={this._renderFooter}
                    refreshing={this.state.loading}
                    onRefresh={() => {
                        this._refresh();
                    }}
                />
            </SafeAreaView>);
    }
}

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    text: {
        // marginLeft: 10,
        fontSize: 14,
        color: "#969696",
    },
    name: {
        // marginLeft: 10,
        fontSize: 20,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        borderColor: "#dddddd",
        marginLeft: '5%',
        marginRight: '5%',
        marginBottom: 5
    },
    divider: {
        marginTop: 5,
        flex: 1,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor
    },
});
