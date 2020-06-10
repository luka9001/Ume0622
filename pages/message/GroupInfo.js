import React, {Component} from "react";
import CommonTitleBar from '../views/CommonTitleBar';
import Global from "../util/Global";
import {
    View, StyleSheet, Text, TouchableOpacity, Dimensions, PixelRatio,
    Image,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView
} from "react-native";
import {Modal, TextareaItem, Toast, Provider} from "@ant-design/react-native";
import jMessage from "../service/jMessage";
import config from "../service/config";
import {RecyclerListView, LayoutProvider, DataProvider} from "recyclerlistview";
import {Icon, Divider} from 'react-native-elements';
import LoadingView from "../views/LoadingView";
import Utils from "../util/Utils";

let {width} = Dimensions.get('window');
const url = config.host;
// 总记录数：totalRecord
// 每页最大记录数：maxResult
// 总页数：totalPage
const maxResult = 10;
let totalPage;
let totalRecord;
export default class GroupInfoScreen extends Component {
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
            groupMembersCount: 0
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
        this.getGroupMembers();
    }

    getGroupMembers() {
        this.page = 1;
        const that = this;
        let _array = null;
                    jMessage.getMembersInfo(JSON.stringify({'array': _array})).then(function (message) {
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
                            visible: false,
                            loading: false
                        });
                    }, function (error) {
                        that.setState({
                            visible: false,
                            loading: false
                        });
                        // alert('发生错误,请联系官方客服');
                    }).done();
    }

    getMoreGroupMembers() {
        this.page = this.page + 1;
        const that = this;

                    jMessage.getMembersInfo(JSON.stringify({'array': _array})).then(function (message) {
                        const _list = message.data;

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
                        that.setState({
                            visible: false,
                        });
                    }, function (error) {
                        that.setState({
                            isLoadMore: false
                        });
                        // alert('发生错误,请联系官方客服');
                    }).done();
    }

    pagination(pageNo, pageSize, array) {
        let offset = (pageNo - 1) * pageSize;
        return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    }

    gotoDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {id});
    };

    renderItem = (type, data) => {
        const text = {
            fontSize: 12,
            color: "#969696"
        };
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        let avatar = require("../images/benutzer.png");
        if (!Utils.isEmpty(lifephotos)) {
            avatar = {uri: url + lifephotos[0]};
        }

        return (
            <TouchableOpacity onPress={() => this.gotoDetail(data.black_uid)}>
                <View style={listItemStyle.container}>
                    <TouchableOpacity onPress={() => this.gotoDetail(data.black_uid)}>
                        <Image style={listItemStyle.avatar} source={avatar}/>
                    </TouchableOpacity>
                    <View style={listItemStyle.content}>
                        <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                            <Text style={listItemStyle.nameText}>{data.name}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
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
                        </View>
                    </View>
                </View>
                <View style={listItemStyle.divider}/>
            </TouchableOpacity>
        );
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this.getMoreGroupMembers();
    };

    _renderFooter = () => {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', backgroundColor: 'white'}}>
                {this.state.isLoadMore === true ? <ActivityIndicator size="small" color="#63B8FF"/> : null}
                <View style={{alignItems: 'center'}}>
                    <Text>{this.state.loadMoreText}</Text>
                </View>
            </View>
        )
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={styles.container}>
                        <CommonTitleBar title={'聊天信息(' + this.state.groupMembersCount + ')'}
                                        nav={this.props.navigation}/>
                        <RecyclerListView
                            forceNonDeterministicRendering
                            layoutProvider={this._layoutProvider}
                            dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}
                            rowRenderer={this.renderItem}
                            extendedState={this.state}
                            onEndReached={this._onLoadMore}
                            // renderFooter={this._renderFooter}
                            onEndReachedThreshold={50}
                            scrollViewProps={{
                                refreshControl: (
                                    <RefreshControl
                                        refreshing={this.state.loading}
                                        onRefresh={async () => {
                                            this.setState({loading: true});
                                            await this.getGroupMembers();
                                        }}
                                    />
                                )
                            }}
                        />
                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}
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
        padding: 10,
        backgroundColor: 'white'
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
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: Global.pageBackgroundColor
    },
    content: {
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: Global.pageBackgroundColor
    },
    bottomBar: {
        height: 50
    },
    divider: {
        width: width,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor
    }
});
