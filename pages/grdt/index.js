import React, {Component} from 'react';
import {
    Modal,
    Dimensions,
    Image,
    PixelRatio,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView
} from "react-native";
import {ListItem, Icon} from "react-native-elements";
import TimeUtils from "../util/TimeUtil";
import {Toast, Provider} from "@ant-design/react-native";

import {RecyclerListView, LayoutProvider, DataProvider} from "recyclerlistview";
import api from '../service/socialApi';
import config from "../service/config";
import mdata from "../util/cache";
import Global from "../util/Global";
import ImageViewer from 'react-native-image-zoom-viewer';
import CommonTitleBar from '../views/CommonTitleBar';
import AntmModal from '@ant-design/react-native/lib/modal/Modal';
import LoadingView from "../views/LoadingView";
import utilsApi from "../service/utilsApi";
import Utils from '../util/Utils';
import FastImage from 'react-native-fast-image'

let {width} = Dimensions.get('window');
const AVATAR_WIDTH = 80;
const HEIGHT = (width * 7) / 10;
const url = config.host;
const ViewTypes = {
    FULL: 0,
    SIX: 2,
    THREE: 3,
    TWO: 4,
    ONE: 5,
    NO: 6
};

const text = {
    fontSize: 12,
    color: "#969696"
};

class Index extends Component {
    constructor(props) {
        super(props);

        this.dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });
        let {width} = Dimensions.get("window");
        this._layoutProvider = new LayoutProvider(
            (index) => {
                let data = this.state.infoList[index];
                let photos = JSON.parse(data.photos);
                if (photos === null) {
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
                    case ViewTypes.FULL: {
                        dim.width = width;
                        dim.height = 354 + 5;
                        break;
                    }
                    case ViewTypes.SIX: {
                        dim.width = width;
                        dim.height = 271 + 5;
                        break;
                    }
                    case ViewTypes.THREE: {
                        dim.width = width;
                        dim.height = 188 + 5;
                        break;
                    }
                    case ViewTypes.TWO: {
                        dim.width = width;
                        dim.height = 188 + 5;
                        break;
                    }
                    case ViewTypes.ONE: {
                        dim.width = width;
                        dim.height = 188 + 5;
                        break;
                    }
                    case ViewTypes.NO: {
                        dim.width = width;
                        dim.height = 99 + 5;
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
            visible: false,
            deleteViewStatus: false
        };
    }

    componentWillUnmount() {
    }

    componentDidMount() {
        if (this.state.infoList.length === 0) {
            this.setState({
                loading: true
            });
            this.getMembers();
        }
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

    renderItem = (type, data) => {
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        let photos = JSON.parse(data.photos);
        let avatar = {uri: url + lifephotos[0]}
        return (
            <TouchableOpacity onPress={this.gotoDetail.bind(this, type, data.id)}>
                <View key={data.id} style={{backgroundColor: 'white'}}>
                    <View style={listItemStyle.container}>
                        <FastImage style={listItemStyle.avatar} source={avatar}/>
                        <View style={listItemStyle.content}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
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
                                <TouchableOpacity onPress={() => {
                                    if (data.is_current_user === 1) {
                                        this.setState({deleteViewStatus: true, reportID: data.id})
                                    } else {
                                        this.setState({reportViewStatus: true, reportID: data.id})
                                    }
                                    // this.setState({reportViewStatus: true, reportID: data.id})
                                }}>
                                    <Icon
                                        name='dots-vertical'
                                        type='material-community'
                                        size={20}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={listItemStyle.msgText}>
                                {data.message + '\n'}
                            </Text>
                            {this.renderImages(photos)}
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}}>
                                <Text style={listItemStyle.timeText}>
                                    {TimeUtils.getFormattedTime(data.created_at)}
                                </Text>
                                <TouchableOpacity onPress={() => {
                                    this._postLike(data.id, data.user_id)
                                }} style={{flexDirection: 'row', justifyContent: 'space-between', marginRight: 10}}>
                                    <Icon
                                        name='thumb-up-outline'
                                        type='material-community'
                                        color="#6E7991"
                                        containerStyle={listItemStyle.commentImg}
                                    />
                                    <Text style={listItemStyle.countText}>
                                        {data.likescount}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.gotoDetail(type, data.id)}
                                                  style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <Icon
                                        name='comment-processing-outline'
                                        type='material-community'
                                        containerStyle={listItemStyle.commentImg}
                                        color="#6E7991"
                                    />
                                    <Text style={listItemStyle.countText}>
                                        {data.commentcount}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={listItemStyle.divider}/>
                </View>
            </TouchableOpacity>
        );
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

    getMembers = () => {
        this.page = 1;
        const that = this;
        const params = {id: this.props.navigation.state.params.id !== 0 ? this.props.navigation.state.params.id : null};
        api.getMySocialList(this.page, JSON.stringify(params)).then(function (message) {
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
            alert('网络错误！请检查后再次尝试！');
        }).done();
    };

    getMoreMembers = () => {
        this.page = this.page + 1;
        const that = this;
        const params = {id: this.props.navigation.state.params.id !== 0 ? this.props.navigation.state.params.id : null};
        api.getMySocialList(this.page, JSON.stringify(params)).then(function (message) {
            let isLoadMore = false;
            if (message.data.length === 10) {
                isLoadMore = true;
            }
            that.setState({
                loadMoreText: isLoadMore === true ? that.state.loadMoreText : '没有了',
                isLoadMore,
                infoList: that.state.infoList.concat(message.data),
                pbBtnStatus: true
            });
            if (!isLoadMore) {
                Toast.info('没有了', 1, undefined, false);
            } else {
                // Toast.info('正在加载更多...', 1, undefined, false);
            }
        }, function (error) {
            that.setState({
                isLoadMore: false,
                pbBtnStatus: true
            });
            alert('网络错误！请检查后再次尝试！');
        }).done();
    };

    _postLike = (social_message_id, to_user_id) => {
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
    };

    _getDataById = (id) => {
        this.state.infoList.map(function (_item, index) {
            if (_item.id === id) {
                mdata.data = _item;
            }
        });
    };

    gotoDetail = (type, id) => {
        this._getDataById(id);
        mdata.type = type;
        mdata.rowHeight = this._getRowHeight(type);
        this.props.navigation.navigate('GcDetail');
    };

    fb = () => {
        if (config.access_token === '') {
            this.props.navigation.navigate('LoginIndex');
        } else {
            this.props.navigation.navigate('GrdtFb', {
                callback: () => {
                    this.PbCallBack();
                }
            });
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
    };

    renderImageRow(arr, start, end) {
        let images = [];
        let imagesViewer = [];
        arr.forEach(element => {
            let imgViewer = {url: url + '/uploadFile/social/' + element};
            imagesViewer.push(imgViewer);
        });
        for (let i = start; i < end; i++) {
            let img = {uri: url + '/uploadFile/social/' + arr[i]};
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
    };

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

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={styles.container}>
                        {
                            this.props.navigation.state.params.id !== 0 ? <CommonTitleBar
                                title={"TA的动态"}
                                nav={this.props.navigation}
                            /> : <CommonTitleBar
                                title={"个人动态"}
                                nav={this.props.navigation}
                                // rightIcon={require("../images/ic_camera.png")}
                                rightIcon={'camera'}
                                handleRightClick={() =>
                                    this.fb()
                                }
                            />
                        }
                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}

                        <Modal visible={this.state.imageViewerStatus} transparent={true} onRequestClose={() => {
                        }}>
                            <ImageViewer onCancel={() => {
                                this.setState({imageViewerStatus: false})
                            }}
                                         enableSwipeDown={true} index={this.state.imageViewerIndex}
                                         imageUrls={this.state.imageViewerSource} onClick={() => {
                                this.setState({
                                    imageViewerStatus: false
                                })
                            }}/>
                        </Modal>
                        <View>
                            <FastImage
                                style={styles.momentImg}
                                source={{uri: this.props.navigation.state.params.id !== 0 ? url + this.props.navigation.state.params.photo : url + config.lifephotos}}
                            />
                            <Text
                                style={styles.userNameText}>{Utils.isEmpty(this.props.navigation.state.params.name) ? config.name : this.props.navigation.state.params.name}</Text>
                            <FastImage style={styles.avatarImg}
                                   source={{uri: this.props.navigation.state.params.id !== 0 ? url + this.props.navigation.state.params.photo : url + config.lifephotos}}/>
                        </View>
                        <RecyclerListView
                            forceNonDeterministicRendering
                            layoutProvider={this._layoutProvider}
                            dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}
                            rowRenderer={this.renderItem}
                            extendedState={this.state}
                            onEndReached={this._onLoadMore}
                            onEndReachedThreshold={50}
                            renderFooter={this._renderFooter}
                            scrollViewProps={{
                                refreshControl: (
                                    <RefreshControl
                                        refreshing={this.state.loading}
                                        onRefresh={async () => {
                                            this.setState({loading: true});
                                            await this.getMembers();
                                        }}
                                    />
                                )
                            }}
                        />
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
        fontSize: 15,
        color: "#54688D"
    },
    msgText: {
        fontSize: 15,
        color: "#000000",
        marginTop: 2
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
        height: 25
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
        flex: 1,
        position: "absolute",
        bottom: 5,
        right: "50%",
        marginRight: -58,
    },
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: "white"
    },
    momentImg: {
        width: width,
        height: HEIGHT,
        marginBottom: 40
    },
    userNameText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        position: "absolute",
        right: 95,
        top: HEIGHT - 25
    },
    avatarImg: {
        width: AVATAR_WIDTH,
        height: AVATAR_WIDTH,
        position: "absolute",
        right: 10,
        top: HEIGHT - 45,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        borderRadius: 5
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
