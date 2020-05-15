import React, {Component} from 'react';
import {
    View,
    Text,
    Modal,
    ActivityIndicator,
    PixelRatio,
    Image,
    Dimensions,
    StyleSheet,
    RefreshControl,
    TouchableOpacity, FlatList,SafeAreaView
} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';
import {RecyclerListView, LayoutProvider, DataProvider} from "recyclerlistview";
import api from '../service/socialApi';
import utilsApi from '../service/utilsApi';
import config from "../service/config";
import mdata from "../util/cache";
import TimeUtils from "../util/TimeUtil";
import Global from "../util/Global";
import {Toast, Provider, Grid} from '@ant-design/react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import TitleBar from '../views/TitleBar';
import AntmModal from '@ant-design/react-native/lib/modal/Modal';
import utils from '../util/Utils';
import UserInfoApi from "../service/UserInfoApi";
import {withNavigationFocus} from 'react-navigation';
import FastImage from 'react-native-fast-image';
import VipLevelView from '../views/VipLevelView';
import {Download} from "../util/DownloadToCamera";

let {height, width} = Dimensions.get('window');
const url = config.host;
const ViewTypes = {
    FULL: 0,
    SIX: 2,
    THREE: 3,
    TWO: 4,
    ONE: 5,
    NO: 6,
    PUSHUSER: 150
};

const text = {
    fontSize: 12,
    color: "#969696"
};

class Index extends Component {
    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        UserInfoApi.getUserInfo();
        return true;
    }

    constructor(props) {
        super(props);

        this.dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });
        let {width} = Dimensions.get("window");
        this._layoutProvider = new LayoutProvider(
            (index) => {
                let data = this.state.infoList[index];
                if (data.type === 'user') {
                    return ViewTypes.PUSHUSER;
                }

                let photos = utils.isEmpty(data.photos) ? null : JSON.parse(data.photos);
                if (utils.isEmpty(photos)) {
                    return ViewTypes.NO;
                } else if (photos.length > 6) {
                    return ViewTypes.FULL;
                } else if (photos.length > 3) {
                    return ViewTypes.SIX;
                } else if (photos.length === 3) {
                    return ViewTypes.THREE;
                } else if (photos.length === 2) {
                    return ViewTypes.TWO;
                } else if (photos.length === 1) {
                    return ViewTypes.ONE;
                } else {
                    return ViewTypes.FULL;
                }

            },
            (type, dim) => {
                switch (type) {
                    case ViewTypes.PUSHUSER: {
                        dim.width = width;
                        dim.height = 136;
                        break;
                    }
                    case ViewTypes.FULL: {
                        dim.width = width;
                        dim.height = 354 + 20;
                        break;
                    }
                    case ViewTypes.SIX: {
                        dim.width = width;
                        dim.height = 271 + 20;
                        break;
                    }
                    case ViewTypes.THREE: {
                        dim.width = width;
                        dim.height = 188 + 20;
                        break;
                    }
                    case ViewTypes.TWO: {
                        dim.width = width;
                        dim.height = 188 + 20;
                        break;
                    }
                    case ViewTypes.ONE: {
                        dim.width = width;
                        dim.height = 188 + 20;
                        break;
                    }
                    case ViewTypes.NO: {
                        dim.width = width;
                        dim.height = 121;
                        break;
                    }
                    default: {
                        dim.width = width;
                        dim.height = 400;
                    }
                }
            }
        );
        this.state = {
            infoList: [],
            loading: false,
            isLoadMore: false,
            loadMoreText: '',
            pbBtnStatus: true,
            imageViewerStatus: false,
            imageViewerSource: [],
            imageViewerIndex: 0,
            reportViewStatus: false,
            reportID: -1,
            deleteViewStatus: false
        };
    }

    _getRowHeight(type) {
        switch (type) {
            case ViewTypes.FULL: {
                return 350;
            }
            case ViewTypes.SIX: {
                return 267;
            }
            case ViewTypes.THREE: {
                return 184;
            }
            case ViewTypes.TWO: {
                return 184;
            }
            case ViewTypes.ONE: {
                return 184;
            }
            case ViewTypes.NO: {
                return 95;
            }
            default: {
                return 396;
            }
        }
    }

    getMembers = () => {
        this.page = 1;
        const that = this;
        api.getSocialList(this.page).then(function (message, user) {
            const _list = message.data.data;
            let isLoadMore = false;
            if (_list.length === 10) {
                isLoadMore = true;
            }

            if (!utils.isEmpty(message.user) && message.user.data.length > 0) {
                let user = message.user;
                user.type = 'user';
                _list.unshift(user);
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
            Toast.info('网络错误，请检查后再次尝试');
        }).done();
    };

    // renderItem = (type, data) => {
    renderItem = ({item}) => {
        if (item.type !== 'user') {
            let isMale = item.sex;
            let lifephotos = JSON.parse(item.lifephoto);
            let photos = JSON.parse(item.photos);
            let avatar;
            if (lifephotos != null) {
                avatar = {uri: url + lifephotos[0], priority: FastImage.priority.normal}
            }
            return (
                <TouchableOpacity style={{width: width}} onPress={this.gotoDetail.bind(this, item.id)}>
                    <View style={listItemStyle.container}>
                        <FastImage style={listItemStyle.avatar} source={avatar}/>
                        <View style={listItemStyle.content}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <View
                                    style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                                    <VipLevelView vipLevel={item.vip_level} style={{width: 30, height: 30}}/>
                                    <Text style={listItemStyle.nameText}>{item.name}</Text>
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
                                        <Text style={text}>{item.live}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => {
                                    if (item.is_current_user === 1) {
                                        this.setState({deleteViewStatus: true, reportID: item.id})
                                    } else {
                                        this.setState({reportViewStatus: true, reportID: item.id})
                                    }
                                }}>
                                    <Icon
                                        name='dots-vertical'
                                        type='material-community'
                                        size={20}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={listItemStyle.msgText}>
                                {item.message + '\n'}
                                {/*{item.message}*/}
                            </Text>
                            {this.renderImages(photos)}
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}}>
                                <Text style={listItemStyle.timeText}>
                                    {TimeUtils.getFormattedTime(item.created_at)}
                                </Text>
                                <TouchableOpacity onPress={() => {
                                    this._postLike(item.id, item.user_id)
                                }} style={{flexDirection: 'row', justifyContent: 'space-between', marginRight: 10}}>
                                    <Icon
                                        name='thumb-up-outline'
                                        type='material-community'
                                        color="#6E7991"
                                        containerStyle={listItemStyle.commentImg}
                                    />
                                    <Text style={listItemStyle.countText}>
                                        {item.likescount}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.gotoDetail(item.id)}
                                                  style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <Icon
                                        name='comment-processing-outline'
                                        type='material-community'
                                        containerStyle={listItemStyle.commentImg}
                                        color="#6E7991"
                                    />
                                    <Text style={listItemStyle.countText}>
                                        {item.commentcount}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider}/>
                </TouchableOpacity>
            );
        } else {
            const gridData = Array.from(item.data).map((_val, i) => ({
                id: _val.id,
                icon: url + JSON.parse(_val.lifephoto)[0]
            }));
            return (
                <View style={{width: width}}>
                    <View style={listItemStyle.container}>
                        <Image style={listItemStyle.avatar} source={require('../images/icon.png')}/>
                        <View style={listItemStyle.content}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                                    <Text style={listItemStyle.nameText}>向您推荐新用户</Text>
                                </View>
                            </View>
                            <View style={{margin: 10}}>
                                <Grid
                                    itemStyle={{width: 80, height: 80}}
                                    data={gridData}
                                    columnNum={3}
                                    carouselMaxRow={1}
                                    carouselProps={{autoplay: true, infinite: true}}
                                    isCarousel
                                    hasLine={false}
                                    onPress={(_el: any, index: any) => {
                                        if (!utils.isEmpty(index)) {
                                            this.gotoUserDetail(_el.id);
                                        }
                                    }}
                                    renderItem={(_el: any, index: any) => {
                                        return (
                                            <FastImage source={{uri: _el.icon, priority: FastImage.priority.normal}}
                                                       style={{width: 80, height: 80, borderRadius: 5}}/>);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider}/>
                </View>
            );
        }
    };

    _renderFooter = () => {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 5
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
        this.setState({
            pbBtnStatus: false
        });
        this.getMoreMembers();
    };

    getMoreMembers = () => {
        this.page = this.page + 1;
        const that = this;
        // Toast.info('正在加载更多...', 1, undefined, false);
        api.getSocialList(this.page).then(function (message) {
            let isLoadMore = false;
            if (message.data.data.length === 10) {
                isLoadMore = true;
            }

            if (!utils.isEmpty(message.user) && message.user.data.length > 0) {
                let user = message.user;
                user.type = 'user';
                message.data.data.unshift(user);
            }

            that.setState({
                loadMoreText: isLoadMore === true ? that.state.loadMoreText : '没有了',
                isLoadMore,
                infoList: that.state.infoList.concat(message.data.data),
                pbBtnStatus: true
            });
            if (!isLoadMore) {
                Toast.info('没有了', 1, undefined, false);
            } else {
                // Toast.info('正在加载更多...', 1, undefined, false);
            }
        }, function (error) {
            that.setState({
                isLoadMore: true,
                pbBtnStatus: true
            });
            Toast.info('网络错误，请检查后再次尝试');
        }).done();
    };

    _postLike = (social_message_id, to_user_id) => {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else {
            const that = this;
            const params = JSON.stringify({social_message_id, to_user_id})
            api.postLike(params).then(function (message) {
                if (message.code === 200) {
                    const infoList = that.state.infoList;
                    for (const key in infoList) {
                        if (infoList.hasOwnProperty(key)) {
                            const element = infoList[key];
                            if (element.id === social_message_id) {
                                element.likescount = element.likescount + 1;
                                that.setState({
                                    infoList
                                });
                            }
                        }
                    }
                } else {
                    Toast.info('发生错误！请联系客服！', 1, undefined, true);
                }
            }).done();
        }
    };

    gotoUserDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {id});
    };

    componentDidMount() {
        if (this.state.infoList.length === 0) {
            this.setState({
                loading: true
            });
            this.getMembers();
        }
    }

    componentDidHide() {
    }

    _getDataById = (id) => {
        this.state.infoList.map(function (_item, index) {
            if (_item.id === id) {
                mdata.data = _item;
            }
        });
    };

    gotoDetail = (id) => {
        this._getDataById(id);

        // mdata.type = type;
        // mdata.rowHeight = this._getRowHeight(type);
        this.props.navigation.navigate('GcDetail');
    };

    fb = () => {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else {
            this.props.navigation.navigate('GrdtFb');
        }
    };

    renderImages(pictures) {
        if (pictures == null || pictures === "") {
            return null;
        }
        let arr = pictures;
        let len = arr.length;
        let images = [];
        if (len > 0) {
            let rowNum = Math.ceil(len / 3);
            for (let i = 0; i < rowNum; i++) {
                let start = i * 3;
                let end = i * 3 + 3;
                if (end > len) {
                    end = len;
                }
                images.push(this.renderImageRow(arr, start, end));
            }
        }
        return <View style={styles.imageContainer}>{images}</View>;
    }

    renderImageRow(arr, start, end) {
        let images = [];
        let imagesViewer = [];
        arr.forEach(element => {
            let imgViewer = {url: url + '/uploadFile/social/' + element};
            imagesViewer.push(imgViewer);
        });
        for (let i = start; i < end; i++) {
            let img = {uri: url + '/uploadFile/social/' + arr[i], priority: FastImage.priority.normal};
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
                    <FastImage source={img} style={styles.imageCell}/>
                </TouchableOpacity>
            );
        }
        return (
            <View key={"row-" + start} style={{flexDirection: "row", marginTop: 3}}>
                {images}
            </View>
        );
    }

    PbCallBack() {
        this.setState({
            loading: true
        });
        this.getMembers();
    }

    delSocialMessage = () => {
        const that = this;
        this.setState({
            visible: true,
            reportViewStatus: false,
            deleteViewStatus: false
        });
        const params = {id: this.state.reportID};
        api.delMySocial(JSON.stringify(params)).then(function (message) {
            that.setState({
                visible: false
            });
            that.PbCallBack();
        }, function (error) {
            that.setState({
                visible: false
            });
            alert('网络错误！请检查后再次尝试！');
        }).done();
    };

    renderLoad() { //这里是写的一个loading
        return (
            <View style={{marginTop: (height / 2) - 20}}>
                <ActivityIndicator animating={true} size={"large"}/>
            </View>
        )
    }

    _keyExtractor = (item, index) => "list-item-" + index;

    _refresh = () => {
        this.setState({loading: true});
        this.getMembers();
    };

    render() {
        return (
            <SafeAreaView
                forceInset={{vertical: 'never', top: 'always'}}
                style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: Global.pageBackgroundColor}}>
                        <TitleBar title={'动态'} nav={this.props.navigation} callback={() => {
                            this.PbCallBack()
                        }} isfilter={false} isCamera={true}/>
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
                                enableSwipeDown={true}
                                index={this.state.imageViewerIndex}
                                imageUrls={this.state.imageViewerSource} onClick={() => {
                                this.setState({
                                    imageViewerStatus: false
                                })
                            }}/>
                        </Modal>

                        <FlatList
                            style={[styles.fill]}
                            data={this.state.infoList}
                            renderItem={this.renderItem}
                            keyExtractor={this._keyExtractor}
                            extraData={this.state}
                            onEndReached={this._onLoadMore}
                            onEndReachedThreshold={50}
                            ListFooterComponent={this._renderFooter}
                            refreshing={this.state.loading}
                            onRefresh={()=>{
                                this._refresh();
                            }}
                        />

                        {/*<RecyclerListView*/}
                        {/*    forceNonDeterministicRendering*/}
                        {/*    layoutProvider={this._layoutProvider}*/}
                        {/*    dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}*/}
                        {/*    rowRenderer={this.renderItem}*/}
                        {/*    extendedState={this.state}*/}
                        {/*    onEndReached={this._onLoadMore}*/}
                        {/*    onEndReachedThreshold={50}*/}
                        {/*    renderFooter={this._renderFooter}*/}
                        {/*    scrollViewProps={{*/}
                        {/*        refreshControl: (*/}
                        {/*            <RefreshControl*/}
                        {/*                refreshing={this.state.loading}*/}
                        {/*                onRefresh={async () => {*/}
                        {/*                    this.setState({loading: true});*/}
                        {/*                    await this.getMembers();*/}
                        {/*                }}*/}
                        {/*            />*/}
                        {/*        )*/}
                        {/*    }}*/}
                        {/*/>*/}
                        <AntmModal
                            popup
                            onClose={() => this.setState({deleteViewStatus: false})}
                            maskClosable={true}
                            visible={this.state.deleteViewStatus}
                            animationType="slide-up"
                        >
                            <ListItem
                                title={'删除'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.delSocialMessage();
                                }}
                            />
                            <ListItem
                                title={'取消'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.setState({
                                        deleteViewStatus: false
                                    })
                                }}
                            />
                        </AntmModal>
                        <AntmModal
                            popup
                            onClose={() => this.setState({reportViewStatus: false})}
                            maskClosable={true}
                            visible={this.state.reportViewStatus}
                            animationType="slide-up"
                        >
                            <ListItem
                                title={'不感兴趣'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 2,
                                        report_id: this.state.reportID,
                                        data: '不感兴趣'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'色情低俗'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 2,
                                        report_id: this.state.reportID,
                                        data: '色情低俗'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'政治敏感'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 2,
                                        report_id: this.state.reportID,
                                        data: '政治敏感'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'广告'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 2,
                                        report_id: this.state.reportID,
                                        data: '广告'
                                    }));
                                }}
                            />

                            <ListItem
                                title={'令人恶心'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 2,
                                        report_id: this.state.reportID,
                                        data: '令人恶心'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'违纪违法'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 2,
                                        report_id: this.state.reportID,
                                        data: '违纪违法'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'其他'}
                                bottomDivider={true}
                                onPress={() => {
                                    this._postReport(JSON.stringify({
                                        type: 2,
                                        report_id: this.state.reportID,
                                        data: '其他'
                                    }));
                                }}
                            />
                            <ListItem
                                title={'取消'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.setState({
                                        reportViewStatus: false
                                    })
                                }}
                            />
                        </AntmModal>
                    </View>
                </Provider>
            </SafeAreaView>
        )
    }

    _postReport(params) {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else {
            let that = this;
            utilsApi.postReport(params).then(
                function (params) {
                    Toast.info('举报成功', 1, undefined, false);
                    that.setState({
                        reportViewStatus: false
                    });
                }, function (error) {
                    that.setState({
                        reportViewStatus: false
                    });
                }
            ).done();
        }
    }
}

const listItemStyle = StyleSheet.create({
    container: {
        // width: width,
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
        // width:'100%',
        flex: 1,
        flexDirection: "column",
        marginLeft: 10
    },
    nameText: {
        marginLeft: 5,
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
        height: 25,
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
    msgText: {
        fontSize: 15,
        lineHeight: 24,
        maxWidth: width - 120
    },
    divider: {
        flex: 1,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor
    },
    pwdDivider: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
        height: 1,
    },
    contentFindView: {
        flex: 1,
        position: "absolute",
        bottom: 5,
        right: "50%",
        marginRight: -58,
    },
    container: {
        flexDirection: "row",
        // justifyContent: "space-between",
        // alignItems: "center",
        flex: 1,
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

export default withNavigationFocus(Index);
