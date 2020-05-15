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
    SafeAreaView,
    FlatList
} from 'react-native';
import {Modal, Toast, Provider, SearchBar, Tabs, TabBar} from '@ant-design/react-native';
import api from '../service/allMembersApi';
import Global from '../util/Global';
import CommonTitleBar from '../views/CommonTitleBar';
import FastImage from 'react-native-fast-image';
import Request from '../service/request';
import Utils from '../util/Utils';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

let {width} = Dimensions.get('window');
const url = config.host;

const Tab = createBottomTabNavigator();

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
        this.getMySignUpPartyList();
    }

    keyExtractor = (item, index) => index.toString();

    // renderItem = (type, data) => {
    renderItem =   ({item, index, separators})=>{
        const text = {
            fontSize: 12,
            color: '#969696',
        };
        // let isMale = data.sex;
        let lifephotos = JSON.parse(data.photos);
        let avatar = {uri: url + '/uploadFile/party/' + lifephotos[0]};
        return (
            <TouchableOpacity onPress={() => {
                this.props.navigation.navigate('PartyCheckingView', {id: data.pid});
            }} style={{backgroundColor: 'white', width: width, justifyContent: 'center'}}>
                <View key={data.id}>
                    <View style={listItemStyle.container}>
                        <FastImage style={listItemStyle.avatar} source={avatar}/>
                        <View style={listItemStyle.content}>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={listItemStyle.nameText}>{data.title}</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{marginRight: 5}}>
                                        <Text style={text}>{data.end_at}</Text>
                                    </View>
                                    <View>
                                        <Text style={text}>{data.address}</Text>
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

    getTypeView(check_status) {
        switch (check_status) {
            case 0: {
                return '等待审核';
            }
            case 1: {
                return '审核通过';
            }
            case 2: {
                return '未通过，请修改';
            }
        }
    }

    renderSecItem = (type, data) => {
        const text = {
            fontSize: 12,
            color: '#969696',
        };
        // let isMale = data.sex;
        let lifephotos = JSON.parse(data.photos);
        let avatar = {uri: url + '/uploadFile/party/' + lifephotos[0]};
        return (
            <TouchableOpacity onPress={() => {
                if (data.check_status === 1) {
                    this.props.navigation.navigate('PartyCheckingView', {id: data.id});
                } else {
                    this.gotoDetail(data.id);
                }
            }} style={{backgroundColor: 'white', width: width, justifyContent: 'center'}}>
                <View key={data.id}>
                    <View style={listItemStyle.container}>
                        <FastImage style={listItemStyle.avatar} source={avatar}/>
                        <View style={listItemStyle.content}>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={listItemStyle.nameText}>{data.title}</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{marginRight: 5}}>
                                        <Text style={text}>{data.end_at}</Text>
                                    </View>
                                    <View>
                                        <Text style={text}>{data.address}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                                    <View>
                                        <Text style={text}>{this.getTypeView(data.check_status)}</Text>
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

    getMySignUpPartyList = () => {
        this.setState({loading: true});
        this.page = 1;
        const that = this;
        Request.get('v1/getmysignupparty?page=' + this.page).then(function (res) {
            const _list = res.data;
            console.log('qianyuan', 'result========+++++++++++++++' + that.state.loading);
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
                moreLoading: false,
                loading: false,
            });
            console.log('qianyuan', 'result=================' + that.state.loading);
        }, function (error) {
            that.setState({
                visible: false,
                moreLoading: false,
                loading: false,
            });
        }).done();
    };

    getMoreMySignUpPartyList = () => {
        this.page = this.page + 1;
        const that = this;
        Toast.info('正在加载更多...', 1, undefined, false);
        Request.get('v1/getmysignupparty?page=' + this.page).then(function (res) {
            const _list = res.data;

            let isLoadMore = false;
            if (_list.length === 10) {
                isLoadMore = true;
            }
            const _loadMoreText = isLoadMore === true ? '正在加载...' : '没有了';
            that.setState({
                loadMoreText: _loadMoreText,
                isLoadMore,
                infoList: that.state.infoList.concat(_list),
                visible: false,
            });
            if (!isLoadMore) {
                Toast.info('没有了', 1, undefined, false);
            } else {
                // Toast.info('正在加载更多...', 1, undefined, false);
            }
        }, function (error) {
            that.setState({
                isLoadMore: false,
            });
            alert('网络错误！请检查后再次尝试！');
        }).done();
    };

    getMyPublishPartyList = () => {
        this.page = 1;
        const that = this;
        Request.get('v1/getmypublishparty?page=' + this.page).then(function (res) {
            const _list = res.data;

            let isLoadMore = false;
            if (_list.length === 10) {
                isLoadMore = true;
            }
            const _loadMoreText = isLoadMore === true ? '正在加载更多...' : '没有了';
            that.setState({
                moreLoadMoreText: _loadMoreText,
                moreIsLoadMore: isLoadMore,
                moreInfoList: _list,
                visible: false,
                moreLoading: false,
            });
        }, function (error) {
            that.setState({
                visible: false,
                moreLoading: false,
            });
        }).done();
    };

    getMoreMyPublishPartyList = () => {
        this.page = this.page + 1;
        const that = this;
        Request.get('v1/getmypublishparty?page=' + this.page).then(function (res) {
            const _list = res.data;

            let isLoadMore = false;
            if (_list.length === 10) {
                isLoadMore = true;
            }
            const _loadMoreText = isLoadMore === true ? '正在加载...' : '没有了';
            that.setState({
                moreLoadMoreText: _loadMoreText,
                moreIsLoadMore: isLoadMore,
                moreInfoList: that.state.moreInfoList.concat(_list),
                visible: false,
            });
            if (!isLoadMore) {
                Toast.info('没有了', 1, undefined, false);
            } else {
                // Toast.info('正在加载更多...', 1, undefined, false);
            }
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
        this.getMoreMySignUpPartyList();
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
        this.getMoreMyPublishPartyList();
    };

    gotoDetail = (id) => {
        this.props.navigation.navigate('PublishPartyView', {
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
            this.getMySignUpPartyList();
        } else if (index === 1) {
            this.setState({
                selectedTab: 1,
            });
            if (this.state.moreInfoList.length === 0) {
                this.setState({
                    visible: true,
                });
                this.getMyPublishPartyList();
            }
        }
    }

    renderContent(pageText) {
        return (
            <View style={{flex: 1, alignItems: 'center', backgroundColor: 'white'}}>
                <SearchBar placeholder="Search" showCancelButton/>
                <Text style={{margin: 50}}>{pageText}</Text>
            </View>
        );
    }

    onChangeTab(tabName) {
        this.setState({
            selectedTab: tabName,
        });
    }

    _keyExtractor = (item, index) => 'list-item-' + index;

    HomeScreen = () => {
        return (
                <FlatList
                    style={{flex:1}}
                    data={this.state.infoList}
                    renderItem={this.renderItem}
                    keyExtractor={this._keyExtractor}
                    extraData={this.state}
                    onEndReached={this._onLoadMore}
                    onEndReachedThreshold={50}
                    ListFooterComponent={this._renderFooter}
                    refreshing={this.state.loading}
                    onRefresh={() => {
                        this.getMySignUpPartyList();
                    }}
                />
                // {/*<RecyclerListView*/}
                // {/*    style={{width: width, backgroundColor: Global.pageBackgroundColor}}*/}
                // {/*    forceNonDeterministicRendering*/}
                // {/*    layoutProvider={this._layoutProvider}*/}
                // {/*    dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}*/}
                // {/*    rowRenderer={this.renderItem}*/}
                // {/*    extendedState={this.state}*/}
                // {/*    onEndReached={this._onLoadMore}*/}
                // {/*    renderFooter={this._renderFooter}*/}
                // {/*    onEndReachedThreshold={50}*/}
                // {/*    scrollViewProps={{*/}
                // {/*        refreshControl: (*/}
                // {/*            <RefreshControl*/}
                // {/*                refreshing={this.state.loading}*/}
                // {/*                onRefresh={async () => {*/}
                // {/*                    this.setState({loading: true});*/}
                // {/*                    await this.getMySignUpPartyList();*/}
                // {/*                }}*/}
                // {/*            />*/}
                // {/*        ),*/}
                // {/*    }}*/}
                // {/*/>*/}
        );
    };

    SettingsScreen = () => {
        return (
                <RecyclerListView
                    style={{flex:1}}
                    forceNonDeterministicRendering
                    layoutProvider={this._layoutProvider}
                    dataProvider={this.dataProvider.cloneWithRows(this.state.moreInfoList)}
                    rowRenderer={this.renderSecItem}
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
                                    await this.getMyPublishPartyList();
                                }}
                            />
                        ),
                    }}
                />
        );
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: Global.pageBackgroundColor}}>
                        <CommonTitleBar title={'我的活动'} nav={this.props.navigation}/>
                        <NavigationContainer>
                            <Tab.Navigator
                                screenOptions={({route}) => ({
                                    tabBarIcon: ({focused, color, size}) => {
                                        let iconName;

                                        if (route.name === '我参与的') {
                                            iconName = focused ? require('../images/party.png') : require('../images/party_outline.png');
                                        } else if (route.name === '我发布的') {
                                            iconName = focused ? require('../images/publish_party.png') : require('../images/publish_party_outline.png');
                                        }

                                        // You can return any component that you like here!
                                        // return <Ionicons name={iconName} size={size} color={color} />;
                                        return <Image style={{width: 25, height: 25}} source={iconName}/>;
                                    },
                                })}
                                tabBarOptions={{
                                    activeTintColor: 'tomato',
                                    inactiveTintColor: 'gray',
                                }}
                            >
                                <Tab.Screen name="我参与的" component={this.HomeScreen}/>
                                <Tab.Screen name="我发布的" component={this.SettingsScreen}/>
                            </Tab.Navigator>
                        </NavigationContainer>
                        {/*<TabBar*/}
                        {/*    unselectedTintColor="#949494"*/}
                        {/*    tintColor='black'*/}
                        {/*    // tintColor="#33A3F4"*/}
                        {/*    // barTintColor="#f5f5f5"*/}
                        {/*>*/}
                        {/*    <TabBar.Item*/}
                        {/*        title="我参与的"*/}
                        {/*        icon={this.state.selectedTab === 0 ? <Image style={{width: 25, height: 25}}*/}
                        {/*                                                    source={require("../images/party.png")}/> :*/}
                        {/*            <Image style={{width: 25, height: 25}}*/}
                        {/*                   source={require("../images/party_outline.png")}/>}*/}
                        {/*        selected={this.state.selectedTab === 0}*/}
                        {/*        onPress={() => this._changeTab(0)}*/}
                        {/*    >*/}
                        {/*        <RecyclerListView*/}
                        {/*            style={{backgroundColor: Global.pageBackgroundColor}}*/}
                        {/*            forceNonDeterministicRendering*/}
                        {/*            layoutProvider={this._layoutProvider}*/}
                        {/*            dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}*/}
                        {/*            rowRenderer={this.renderItem}*/}
                        {/*            extendedState={this.state}*/}
                        {/*            onEndReached={this._onLoadMore}*/}
                        {/*            renderFooter={this._renderFooter}*/}
                        {/*            onEndReachedThreshold={50}*/}
                        {/*            scrollViewProps={{*/}
                        {/*                refreshControl: (*/}
                        {/*                    <RefreshControl*/}
                        {/*                        refreshing={this.state.loading}*/}
                        {/*                        onRefresh={async () => {*/}
                        {/*                            this.setState({loading: true});*/}
                        {/*                            await this.getMySignUpPartyList();*/}
                        {/*                        }}*/}
                        {/*                    />*/}
                        {/*                )*/}
                        {/*            }}*/}
                        {/*        />*/}
                        {/*    </TabBar.Item>*/}
                        {/*    <TabBar.Item*/}
                        {/*        icon={*/}
                        {/*            this.state.selectedTab === 1 ? <Image style={{width: 25, height: 25}}*/}
                        {/*                                                  source={require("../images/publish_party.png")}/> :*/}
                        {/*                <Image style={{width: 25, height: 25}}*/}
                        {/*                       source={require("../images/publish_party_outline.png")}/>*/}
                        {/*        }*/}
                        {/*        title="我发布的"*/}
                        {/*        selected={this.state.selectedTab === 1}*/}
                        {/*        onPress={() => this._changeTab(1)}*/}
                        {/*    >*/}
                        {/*        <RecyclerListView*/}
                        {/*            style={{backgroundColor: Global.pageBackgroundColor}}*/}
                        {/*            forceNonDeterministicRendering*/}
                        {/*            layoutProvider={this._layoutProvider}*/}
                        {/*            dataProvider={this.dataProvider.cloneWithRows(this.state.moreInfoList)}*/}
                        {/*            rowRenderer={this.renderSecItem}*/}
                        {/*            extendedState={this.state}*/}
                        {/*            onEndReached={this._onSecondTabLoadMore}*/}
                        {/*            renderFooter={this._onSecondTabRenderFooter}*/}
                        {/*            onEndReachedThreshold={50}*/}
                        {/*            scrollViewProps={{*/}
                        {/*                refreshControl: (*/}
                        {/*                    <RefreshControl*/}
                        {/*                        refreshing={this.state.moreLoading}*/}
                        {/*                        onRefresh={async () => {*/}
                        {/*                            this.setState({moreLoading: true});*/}
                        {/*                            await this.getMyPublishPartyList();*/}
                        {/*                        }}*/}
                        {/*                    />*/}
                        {/*                )*/}
                        {/*            }}*/}
                        {/*        />*/}
                        {/*    </TabBar.Item>*/}
                        {/*</TabBar>*/}
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
