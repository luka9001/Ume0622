import React, {Component} from 'react';
import {SafeAreaView} from 'react-native';
import config from "../service/config";
import {RecyclerListView, LayoutProvider, DataProvider} from "recyclerlistview";
import {Button, Icon, Divider} from 'react-native-elements';
import {
    Text,
    View,
    ActivityIndicator,
    Image,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    PixelRatio
} from 'react-native';
import TimeUtils from "../util/TimeUtil";
import {Modal, TextareaItem, Toast, Provider} from "@ant-design/react-native";
import api from '../service/socialApi';
import Global from "../util/Global";
import CommonTitleBar from '../views/CommonTitleBar';
import FastImage from "react-native-fast-image";

let {height, width} = Dimensions.get('window');
const url = config.host;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            infoList: [],
            loading: false,
            isLoadMore: false,
            loadMoreText: '',
            popupStatus: false,
            autoFocus: false,
            visible: true,
        };
        this.dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });
        this._layoutProvider = new LayoutProvider(
            (index) => {
                return 1;
            },
            (type, dim) => {
                dim.width = width;
                dim.height = 94;
            }
        );
        this._getThumbup();
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = (type, data) => {
        const text = {
            fontSize: 12,
            color: "#969696"
        };
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        let avatar = {uri: url + lifephotos[0]};
        return (
            <View style={{width: width, justifyContent: 'center', backgroundColor: 'white'}}>
                <View style={listItemStyle.container}>
                    <TouchableOpacity onPress={() => {
                        this.gotoDetail(data.liked_uid)
                    }}>
                        <FastImage style={listItemStyle.avatar} source={avatar}/>
                    </TouchableOpacity>
                    <View style={listItemStyle.content}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={listItemStyle.nameText}>{data.name}</Text>
                            {isMale === 0 ? <Icon
                                name='gender-male'
                                type='material-community'
                                color='#6495ED'
                                style={{marginRight: 8}}
                                size={15}
                            /> : <Icon
                                name='gender-female'
                                type='material-community'
                                color='#EE6A50'
                                style={{marginRight: 8}}
                                size={15}
                            />}
                            <View>
                                <Text style={text}>{data.live}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={listItemStyle.timeText}>
                                {TimeUtils.getFormattedTime(data.created_at)}
                            </Text>
                        </View>
                    </View>

                    <View style={{justifyContent: 'center', height: 40}}>
                        <Icon
                            name='thumb-up-outline'
                            type='material-community'
                            // containerStyle={listItemStyle.commentImg}
                        />
                    </View>
                    <View style={{justifyContent: 'center', height: 40, width: 50, backgroundColor: '#EAEAEA'}}>
                        <Text>
                            {data.message + '...'}
                        </Text>
                    </View>
                </View>
                <Divider style={{backgroundColor: '#EAEAEA', width: '100%'}}/>
            </View>
        );
    };


    _getThumbup = () => {
        this.page = 1;
        const that = this;
        api.getThumbUpByUser(this.page).then(function (message) {
            if (message.code === 200) {
                const _list = message.data.data;

                let isLoadMore = false;
                if (_list.length === 10) {
                    isLoadMore = true;
                }
                const _loadMoreText = isLoadMore === true ? '正在加载更多...' : '没有了';
                that.setState({
                    loadMoreText: _loadMoreText,
                    isLoadMore,
                    infoList: _list,
                });
            } else {
                Toast.info('发生错误！请联系官方客服！');
            }
            that.setState({
                visible: false,
                loading: false
            });
        }).done();
    };

    _getMoreThumbup = () => {
        this.page = this.page + 1;
        const that = this;
        // Toast.info('正在加载更多...', 1, undefined, false);
        api.getThumbUpByUser(this.page).then(function (message) {
            if (message.code === 200) {
                const _list = message.data.data;

                let isLoadMore = false;
                if (_list.length === 10) {
                    isLoadMore = true;
                }
                const _loadMoreText = isLoadMore === true ? '正在加载...' : '没有了';
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
            } else {
                Toast.info('发生错误！请联系官方客服！');
            }
            that.setState({
                visible: false,
            });
        }, function (error) {
            that.setState({
                isLoadMore: false
            });
            alert('网络错误！请检查后再次尝试！');
        }).done();
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this._getMoreThumbup();
    };

    _renderFooter = () => {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 5}}>
                {this.state.isLoadMore === true ? <ActivityIndicator size="small" color="#63B8FF"/> : null}
                <View style={{alignItems: 'center'}}>
                    <Text>{this.state.loadMoreText}</Text>
                </View>
            </View>
        )
    };

    gotoDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {id});
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: Global.pageBackgroundColor}}>
                        <CommonTitleBar title={'所有点赞'} nav={this.props.navigation}/>
                        <RecyclerListView
                            forceNonDeterministicRendering
                            layoutProvider={this._layoutProvider}
                            dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}
                            rowRenderer={this.renderItem}
                            extendedState={this.state}
                            onEndReached={this._onLoadMore}
                            renderFooter={this._renderFooter}
                            onEndReachedThreshold={50}
                            scrollViewProps={{
                                refreshControl: (
                                    <RefreshControl
                                        refreshing={this.state.loading}
                                        onRefresh={async () => {
                                            this.setState({loading: true});
                                            await this._getThumbup();
                                        }}
                                    />
                                )
                            }}
                        />
                        <Modal
                            popup
                            visible={this.state.popupStatus}
                            animationType="slide-up"
                            onClose={this.onClose2}
                            maskClosable={true}
                        >
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <TextareaItem autoHeight
                                              count={100}
                                              style={{width: width * 0.8}}
                                              value={this.state.text}
                                              autoFocus={this.state.autoFocus}
                                              placeholder={this.commentPlaceholder}
                                              onChangeText={(text) => this.setState({text})}/>
                                <View style={{justifyContent: 'center'}}>
                                    <Button
                                        title='回复'
                                        onPress={() => this.onSubmit()}
                                        buttonStyle={{height: 40}}
                                        containerStyle={{width: width * 0.2, borderRadius: 15, paddingHorizontal: 10}}
                                    />
                                </View>
                            </View>
                        </Modal>
                        <Modal
                            transparent
                            maskClosable={false}
                            visible={this.state.visible}
                        >
                            <ActivityIndicator size="large" color="#63B8FF"/>
                        </Modal>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

const listItemStyle = StyleSheet.create({
    container: {
        width: width,
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 10
    },
    imageContainer: {
        flexDirection: "column",
        marginTop: 6
    },
    imageCell: {
        width: 80,
        height: 80,
        marginRight: 3
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 5
    },
    content: {
        flex: 1,
        flexDirection: "column",
        marginLeft: 10
    },
    nameText: {
        marginRight: 8,
        fontSize: 15,
        color: "#54688D"
    },
    msgText: {
        fontSize: 15,
        color: "#000000",
        marginTop: 2
    },
    countText: {
        fontSize: 15,
        color: "#6E7991",
    },
    timeContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 10
    },
    timeText: {
        flex: 1,
        fontSize: 12,
        color: "#999999"
    },
    commentImg: {
        width: 25,
        height: 17
    },
    divider: {
        flex: 1,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor
    },
    commentContainer: {
        flex: 1
    },
    commentContent: {
        backgroundColor: "#EEEEEE",
        padding: 6
    },
    favorContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    favorImg: {
        width: 13,
        height: 13,
        marginRight: 5,
        marginTop: 5
    },
    commentText: {
        flex: 1,
        fontSize: 13,
        color: "#54688D",
        marginTop: 2
    }
});

const styles = StyleSheet.create({
    contentFindView: {
        height: 50,
        // flex: 1,
        // position: "absolute",
        bottom: 0,
        // right: "50%",
        // marginRight: -58,
    },
    container: {
        height: this.rowHeight,
        flexDirection: "row",
        // justifyContent: "space-between",
        // alignItems: "center",
        // flex: 1,
        backgroundColor: "#fff",
        // borderWidth: 1,
        borderColor: "#dddddd",
        marginBottom: 10,
        // padding: 15
    },
    scroll: {
        padding: 5,
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    topicLeft: {
        width: width - 210,
        marginRight: 10
    },
    topicRight: {
        backgroundColor: "#f5f5f5",
        width: 140,
        height: 140,
        padding: 15
    },
    topicTitle: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 28
    },
    topicContext: {
        color: "#999",
        fontSize: 12,
        lineHeight: 18,
        marginTop: 10
    },
    topicNum: {
        fontSize: 14,
        marginTop: 20
    },
    topicRightText: {
        fontSize: 14,
        color: "#666"
    },
    image: {
        margin: 5,
        width: 50,
        height: 50,
        backgroundColor: '#F0F0F0'
    },
    imageContainer: {
        flexDirection: "column",
        marginTop: 6
    },
    imageCell: {
        width: 80,
        height: 80,
        marginRight: 3
    },
});

export default Index;
