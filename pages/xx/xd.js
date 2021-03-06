import React, {Component} from 'react';
import config from '../service/config';
import {RecyclerListView, LayoutProvider, DataProvider} from 'recyclerlistview';
import {Icon, Divider} from 'react-native-elements';
import {
    Text,
    View,
    ActivityIndicator,
    Image,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    PixelRatio,
    SafeAreaView, FlatList, ScrollView,
} from 'react-native';
import {Modal, Toast, Provider, SearchBar, Tabs, TabBar} from '@ant-design/react-native';
import api from '../service/allMembersApi';
import Global from '../util/Global';
import CommonTitleBar from '../views/CommonTitleBar';
import FastImage from 'react-native-fast-image';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

let {width} = Dimensions.get('window');
const url = config.host;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //我关注了谁
            infoList: [],
            loading: false,
            isLoadMore: false,
            loadMoreText: '',
            popupStatus: false,
            autoFocus: false,
            visible: true,

            //谁关注了我
            moreInfoList: [],
            moreLoading: false,
            moreIsLoadMore: false,
            moreLoadMoreText: '',
            morePopupStatus: false,
            moreAutoFocus: false,
            moreVisible: true,
            selectedTab: 0,//选中tab的index
            page: 1,
            totalPage: 2,
            firstBtnImg: require('../images/party.png'),
            secondBtnImg: require('../images/publish_party_outline.png'),
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
            },
        );
        this._getMyFavorites();
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = (type, data) => {
        const text = {
            fontSize: 12,
            color: '#969696',
        };
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        let avatar = {uri: url + lifephotos[0]};
        return (
            <TouchableOpacity onPress={() => {
                this.gotoDetail(data.id);
            }} style={{backgroundColor: 'white', width: width, justifyContent: 'center'}}>
                <View key={data.id}>
                    <View style={listItemStyle.container}>
                        <TouchableOpacity onPress={() => {
                            this.gotoDetail(data.id);
                        }}>
                            <FastImage style={listItemStyle.avatar} source={avatar}/>
                        </TouchableOpacity>
                        <View style={listItemStyle.content}>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={listItemStyle.nameText}>{data.name}</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                </View>
                <Divider style={{backgroundColor: '#EAEAEA', width: width}}/>
            </TouchableOpacity>
        );
    };


    _getMyFavorites = () => {
        this.page = 1;
        const that = this;
        api.getMyFavorites(this.page).then(function (message) {
            if (message.code === 200) {
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
                });
            } else {
                Toast.info('发生错误！请联系官方客服！');
            }
            that.setState({
                visible: false,
                loading: false,
            });
        }).done();
    };

    _getMoreMyFavorites = () => {
        this.page = this.page + 1;
        const that = this;
        Toast.info('正在加载更多...', 1, undefined, false);
        api.getMyFavorites(this.page).then(function (message) {
            if (message.code === 200) {
                const _list = message.data;

                let isLoadMore = false;
                if (_list.length === 10) {
                    isLoadMore = true;
                }
                const _loadMoreText = isLoadMore === true ? '正在加载...' : '没有了';
                that.setState({
                    loadMoreText: isLoadMore === true ? that.state.loadMoreText : '没有了',
                    isLoadMore,
                    infoList: that.state.infoList.concat(_list),
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
                isLoadMore: false,
            });
            alert('网络错误！请检查后再次尝试！');
        }).done();
    };

    _getFavoriteMe = () => {
        this.page = 1;
        const that = this;
        api.getFavoriteMe(this.page).then(function (message) {
            if (message.code === 200) {
                const _list = message.data;

                let isLoadMore = false;
                if (_list.length === 10) {
                    isLoadMore = true;
                }
                const _loadMoreText = isLoadMore === true ? '正在加载更多...' : '没有了';
                that.setState({
                    moreLoadMoreText: _loadMoreText,
                    moreIsLoadMore: isLoadMore,
                    moreInfoList: _list,
                });
            } else {
                Toast.info('发生错误！请联系官方客服！');
            }
            that.setState({
                visible: false,
                moreLoading: false,
            });
        }).done();
    };

    _getMoreFavoriteMe = () => {
        this.page = this.page + 1;
        const that = this;
        // Toast.info('正在加载更多...', 1, undefined, false);
        api.getFavoriteMe(this.page).then(function (message) {
            if (message.code === 200) {
                const _list = message.data;

                let isLoadMore = false;
                if (_list.length === 10) {
                    isLoadMore = true;
                }
                const _loadMoreText = isLoadMore === true ? '正在加载...' : '没有了';
                that.setState({
                    moreLoadMoreText: isLoadMore === true ? that.state.moreLoadMoreText : '没有了',
                    moreIsLoadMore: isLoadMore,
                    moreInfoList: that.state.moreInfoList.concat(_list),
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
                moreIsLoadMore: false,
            });
            alert('网络错误！请检查后再次尝试！');
        }).done();
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this._getMoreMyFavorites();
    };

    _renderFooter = () => {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 5}}>
                {this.state.isLoadMore === true ? <ActivityIndicator size="small" color="#63B8FF"/> : null}
                <View style={{alignItems: 'center'}}>
                    <Text>{this.state.loadMoreText}</Text>
                </View>
            </View>
        );
    };

    _onSecondTabRenderFooter = () => {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 5}}>
                {this.state.moreIsLoadMore === true ? <ActivityIndicator size="small" color="#63B8FF"/> : null}
                <View style={{alignItems: 'center'}}>
                    <Text>{this.state.moreLoadMoreText}</Text>
                </View>
            </View>
        );
    };

    _onSecondTabLoadMore = () => {
        if (!this.state.moreIsLoadMore) {
            return;
        }
        this._getMoreFavoriteMe();
    };

    gotoDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {
            id, callback: () => {
                this.callBack();
            },
        });
    };

    callBack() {
        this._changeTab(this.state.selectedTab);
    }

    _changeTab(index) {
        if (index === 0) {
            this.setState({
                selectedTab: 0,
            });
            this.setState({
                visible: true,
            });
            this._getMyFavorites();
        } else if (index === 1) {
            this.setState({
                selectedTab: 1,
            });
            if (this.state.moreInfoList.length === 0) {
                this.setState({
                    visible: true,
                });
                this._getFavoriteMe();
            }
        }
    }

    lastPage() {
        if (this.state.page !== 1) {
            let currentPage = this.state.page;
            this.setState({
                page: --currentPage,
                selectedTab: 0,
                visible: true,
            });
            let currentWidth = currentPage * width;
            this.pagination.scrollTo({x: currentWidth - width, y: 0, animated: true});
            this._getMyFavorites();
        }
    }

    nextPage() {
        if (this.state.page !== this.state.totalPage) {
            let currentPage = this.state.page;
            this.pagination.scrollTo({x: width * currentPage, y: 0, animated: true});
            this.setState({
                page: ++currentPage,
                selectedTab: 1,
                visible: true
            });
            this._getFavoriteMe();
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1}}>
                        <CommonTitleBar title={'关注'} nav={this.props.navigation}/>
                        <ScrollView ref={(pagination) => this.pagination = pagination} pagingEnabled={true}
                                    horizontal={true} scrollEnabled={false}>
                            <RecyclerListView
                                style={{flex: 1, width: width}}
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
                                                await this._getMyFavorites();
                                            }}
                                        />
                                    ),
                                }}
                            />
                            <RecyclerListView
                                style={{flex: 1, width: width}}
                                forceNonDeterministicRendering
                                layoutProvider={this._layoutProvider}
                                dataProvider={this.dataProvider.cloneWithRows(this.state.moreInfoList)}
                                rowRenderer={this.renderItem}
                                extendedState={this.state}
                                onEndReached={this._onSecondTabLoadMore}
                                renderFooter={this._onSecondTabRenderFooter}
                                onEndReachedThreshold={50}
                                scrollViewProps={{
                                    refreshControl: (
                                        <RefreshControl
                                            refreshing={this.state.moreLoading}
                                            onRefresh={async () => {
                                                this.setState({moreLoading: true});
                                                await this._getFavoriteMe();
                                            }}
                                        />
                                    ),
                                }}
                            />
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
                                <View style={[styles.pageBtn, {backgroundColor: 'white'}]}>
                                    {/*<Image style={{width: 30, height: 30, marginTop: 5, marginBottom: 5}}*/}
                                    {/*       source={this.state.firstBtnImg}/>*/}
                                    <Icon
                                        name='heart-circle'
                                        type='material-community'
                                        color={this.state.selectedTab === 0 ? 'pink' : '#949494'}
                                        style={{marginRight: 8}}
                                        size={30}
                                    />
                                    <Text style={{
                                        color: 'black',
                                        fontSize: 16,
                                        marginBottom: 5,
                                    }}>我的关注</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.6} onPress={() => this.nextPage()}>
                                <View style={[styles.pageBtn, {backgroundColor: 'white'}]}>
                                    {/*<Image style={{width: 30, height: 30, marginTop: 5, marginBottom: 5}}*/}
                                    {/*       source={this.state.secondBtnImg}/>*/}
                                    <Icon
                                        name='heart-circle-outline'
                                        type='material-community'
                                        color={this.state.selectedTab === 1 ? 'pink' : '#949494'}
                                        style={{marginRight: 8}}
                                        size={30}
                                    />
                                    <Text style={{
                                        color: 'black',
                                        fontSize: 16,
                                        marginBottom: 5,
                                    }}>谁关注我</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Modal
                        transparent
                        maskClosable={false}
                        visible={this.state.visible}
                    >
                        <ActivityIndicator size="large" color="#63B8FF"/>
                    </Modal>
                </Provider>
            </SafeAreaView>
        );
    }
}

const listItemStyle = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        // backgroundColor: 'white'
    },
    imageContainer: {
        flexDirection: 'column',
        marginTop: 6,
    },
    imageCell: {
        width: 80,
        height: 80,
        marginRight: 3,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 5,
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 10,
    },
    nameText: {
        marginRight: 8,
        fontSize: 15,
        color: '#54688D',
    },
    msgText: {
        fontSize: 15,
        color: '#000000',
        marginTop: 2,
    },
    countText: {
        fontSize: 15,
        color: '#6E7991',
    },
    timeContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
    },
    timeText: {
        flex: 1,
        fontSize: 12,
        color: '#999999',
    },
    commentImg: {
        width: 25,
        height: 17,
    },
    divider: {
        flex: 1,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor,
    },
    commentContainer: {
        flex: 1,
    },
    commentContent: {
        backgroundColor: '#EEEEEE',
        padding: 6,
    },
    favorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favorImg: {
        width: 13,
        height: 13,
        marginRight: 5,
        marginTop: 5,
    },
    commentText: {
        flex: 1,
        fontSize: 13,
        color: '#54688D',
        marginTop: 2,
    },
});

const styles = StyleSheet.create({
    pageBtn: {
        width: width / 3,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: Global.pageBackgroundColor,
        backgroundColor: '#63B8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        flexDirection: 'row',
        // justifyContent: "space-between",
        // alignItems: "center",
        // flex: 1,
        backgroundColor: '#fff',
        // borderWidth: 1,
        borderColor: '#dddddd',
        marginBottom: 10,
        // padding: 15
    },
    scroll: {
        padding: 5,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    topicLeft: {
        width: width - 210,
        marginRight: 10,
    },
    topicRight: {
        backgroundColor: '#f5f5f5',
        width: 140,
        height: 140,
        padding: 15,
    },
    topicTitle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 28,
    },
    topicContext: {
        color: '#999',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 10,
    },
    topicNum: {
        fontSize: 14,
        marginTop: 20,
    },
    topicRightText: {
        fontSize: 14,
        color: '#666',
    },
    image: {
        margin: 5,
        width: 50,
        height: 50,
        backgroundColor: '#F0F0F0',
    },
    imageContainer: {
        flexDirection: 'column',
        marginTop: 6,
    },
    imageCell: {
        width: 80,
        height: 80,
        marginRight: 3,
    },
});

export default Index;
