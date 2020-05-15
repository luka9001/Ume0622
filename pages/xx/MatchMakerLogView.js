import React, {Component} from 'react';
import {Button, Divider, Icon, ListItem} from 'react-native-elements';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Modal,
    SafeAreaView
} from 'react-native';
import config from "../service/config";
import mdata from "../util/cache";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import TimeUtils from "../util/TimeUtil";
import {Modal as AntmModal, Provider, TextareaItem, Toast, Card} from "@ant-design/react-native";
import api from '../service/socialApi';
import Global from "../util/Global";
import Utils from '../util/Utils';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from "../views/LoadingView";
import ImageViewer from "react-native-image-zoom-viewer";
import MatchMakerApi from "../service/MatchMakerApi";
import FastImage from "react-native-fast-image";

let {width} = Dimensions.get('window');
const url = config.host;
export default class MatchMakerLogView extends Component {
    componentDidMount() {
        if (this.state.infoList.length === 0) {
            console.log(mdata.data.id);
            this.getMatchMakerLogPage(mdata.data.id);
        }

        // this.rowHeight = mdata.rowHeight;
    }

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
            likescount: mdata.data.likescount,
            commentcount: mdata.data.commentcount,
            reportViewStatus: false,
            reportID: -1,
            deleteViewStatus: false,
            imageViewerStatus: false,
            imageViewerSource: [],
            imageViewerIndex: 0,
            matchMakerStatus: 0
        };
        this.dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });
        this._layoutProvider = new LayoutProvider(
            (index) => {
                return 1;
            },
            (type, dim, index) => {
                dim.width = width;
                dim.height = 94;
            }
        );
    }

    handleChange = (value) => {
        this.setState({
            value
        });
        return value;
    };

    onSubmit = () => {
        let data = mdata.data;
        if (Utils.isEmpty(this.state.text.trim())) {
            Toast.info('请填写回复内容！', 1, undefined, false);
        } else {
            this.setState({
                visible: true
            });
            let _text = this.state.text;
            if (!Utils.isEmpty(this.commentPlaceholder)) {
                _text = this.commentPlaceholder + ' ' + this.state.text;
            }
            this.postMatchMakerLog(data.id, _text);
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
    }

    renderItem = (type, data, index) => {
        // let isMale = data.sex;
        // let lifephotos = JSON.parse(data.lifephoto);
        let _data = mdata.data;
        let isMale = _data.sex;
        let lifephotos = JSON.parse(_data.lifephoto);
        let avatar = data.type === 0 ? {uri: url + lifephotos[0]} : require('../images/icon.png');
        return (
            // <TouchableOpacity onPress={() => {
            //     this.setState({
            //         popupStatus: true,
            //         autoFocus: true
            //     });
            //     this.commentPlaceholder = '@' + data.name + ' ';
            //     this.to_user_id = data.from_user_id;
            // }}>
            <View style={{width: width, paddingTop: 10, backgroundColor: 'white'}}>
                <View style={listItemStyle.container}>
                    <TouchableOpacity onPress={() => {
                        this.gotoDetail(data.from_user_id)
                    }}>
                        <FastImage style={listItemStyle.avatar} source={avatar}/>
                    </TouchableOpacity>
                    <View style={listItemStyle.content}>
                        {/*<View style={{flexDirection: 'row', alignItems: 'flex-start'}}>*/}
                        {/*    <Text style={listItemStyle.nameText}>{data.name}</Text>*/}
                        {/*    {isMale === 0 ? <Icon*/}
                        {/*        name='gender-male'*/}
                        {/*        type='material-community'*/}
                        {/*        color='#6495ED'*/}
                        {/*        style={{marginRight: 8}}*/}
                        {/*        size={15}*/}
                        {/*    /> : <Icon*/}
                        {/*        name='gender-female'*/}
                        {/*        type='material-community'*/}
                        {/*        color='#EE6A50'*/}
                        {/*        style={{marginRight: 8}}*/}
                        {/*        size={15}*/}
                        {/*    />}*/}
                        {/*    <View>*/}
                        {/*        <Text style={text}>{data.live}</Text>*/}
                        {/*    </View>*/}
                        {/*</View>*/}
                        <Text style={listItemStyle.msgText}>
                            {data.content + '\n'}
                        </Text>
                    </View>
                </View>
                <View style={{marginLeft: 10, marginTop: 15}}>
                    <Text style={listItemStyle.timeText}>
                        {TimeUtils.getFormattedTime(data.created_at)}
                    </Text>
                </View>
                <Divider style={{backgroundColor: '#EAEAEA', width: width}}/>
            </View>
            // </TouchableOpacity>
        );
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this.getMoreMatchMakerLogPage(mdata.data.id);
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

    onClose2 = () => {
        this.setState({
            popupStatus: false,
            autoFocus: false
        });
    };

    postMatchMakerLog = (mid, content) => {
        const that = this;
        const params = JSON.stringify({mid, content, type: 0});
        MatchMakerApi.postMatchMakerLog(params).then(function (message) {
            if (message.code === 200) {
                that.getMatchMakerLogPage(mid);
                that.setState({
                    text: ''
                })
                //表示已关闭
            } else if (message.code === 202) {
                that.setState({matchMakerStatus: message.matchmakerstatus})
                AntmModal.alert('提醒', '本次求助已经由客服关闭', [{text: '知道了'}])
            } else {
                Toast.info('发生错误！请联系客服！', 1, undefined, true);
            }
            that.setState({
                visible: false,
                popupStatus: false,
            });
        }, function (error) {
            that.setState({
                visible: false,
                popupStatus: false,
            });
        }).done();
    };

    getMatchMakerLogPage = (mid) => {
        this.page = 1;
        const that = this;
        MatchMakerApi.getMatchMakerLogPage(this.page, mid).then(function (message) {
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
                    matchMakerStatus: message.matchmakerstatus
                });
            } else {
                Toast.info('发生错误！请联系官方客服！');
            }
            that.setState({
                visible: false,
                loading: false
            });
        }, function (error) {
            that.setState({
                visible: false,
                loading: false
            });
            Toast.info('网络错误！请检查后再次尝试！');
        }).done();
    };

    getMoreMatchMakerLogPage = (mid) => {
        this.page = this.page + 1;
        const that = this;
        MatchMakerApi.getMatchMakerLogPage(this.page, JSON.stringify({mid})).then(function (message) {
            if (message.code === 200) {
                const _list = message.data.data;

                let isLoadMore = false;
                if (_list.length === 10) {
                    isLoadMore = true;
                }
                const _loadMoreText = isLoadMore === true ? '正在加载...' : '没有了';
                // that.setState({
                //   loadMoreText: _loadMoreText,
                //   isLoadMore,
                //   infoList: _list,
                // });
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
            Toast.info('网络错误！请检查后再次尝试！');
        }).done();
    };

    gotoDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {id});
    };

    delMyComment() {
        const that = this;
        const params = {comment_id: this.state.reportID};
        this.setState({
            visible: true,
            deleteViewStatus: false
        });
        api.delMyComment(JSON.stringify(params)).then(
            res => {
                that.setState({
                    visible: false
                });
                this.PbCallBack();
            },
            err => {
                Toast.info('网络连接失败，请检查后再试');
            }
        ).done();
    }

    PbCallBack() {
        this.setState({
            loading: true
        });
        this.getMatchMakerLogPage(mdata.data.id);
    }

    getQuestionContent = (index) => {
        return config.matchMakerItems[index].value;
    };

    getSexItem = (data) => {
        if (data.sex === 0) {
            return (
                <View
                    style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon
                        name='gender-female'
                        type='material-community'
                        color='#EE6A50'
                        size={15}/>
                    <Text>{data.live}</Text>
                </View>
            )
        } else {
            return (
                <View
                    style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon
                        name='gender-male'
                        type='material-community'
                        color='#6495ED'
                        size={15}
                    />
                    <Text>{data.live}</Text>
                </View>
            );
        }
    };

    render() {
        let data = mdata.data;
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: Global.pageBackgroundColor}}>
                        <Modal visible={this.state.imageViewerStatus} transparent={true}>
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
                                    this.delMyComment();
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
                        <CommonTitleBar
                            title={'专属红娘'}
                            nav={this.props.navigation}
                        />
                        <TouchableOpacity onPress={() => {
                            this.gotoDetail(data.user_id)
                        }}>
                            <Card full={true}>
                                <Card.Header
                                    title={data.name}
                                    thumbStyle={{width: 30, height: 30, borderRadius: 5}}
                                    thumb={url + lifephotos[0]}
                                    extra={this.getSexItem(data)}
                                />
                                <Card.Body>
                                    <View>
                                        <Text style={{
                                            marginLeft: 16,
                                            fontSize: 16
                                        }}>{this.getQuestionContent(data.question)}</Text>
                                        {
                                            Utils.isEmpty(data.detail) ? null : <View>
                                                <Text
                                                    style={{fontSize: 16, marginLeft: 16,}}>描述：{data.detail + '\n'}
                                                </Text>
                                            </View>
                                        }
                                    </View>
                                </Card.Body>
                                <Card.Footer
                                    content={TimeUtils.getFormattedTime(data.created_at)}
                                    extra={data.status === 0 ?
                                        <Text style={{color: '#19AD17', textAlign: 'right'}}>进行中</Text> :
                                        <Text style={{color: 'red', textAlign: 'right'}}>已结束</Text>}
                                />
                            </Card>
                        </TouchableOpacity>
                        <View style={{padding: 10, backgroundColor: '#ffffff'}}><Text style={{fontSize: 16}}>所有回复</Text></View>
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
                                            await this.getMatchMakerLogPage(data.id);
                                        }}
                                    />
                                )
                            }}
                        />

                        <AntmModal
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
                        </AntmModal>

                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}

                        {this.state.matchMakerStatus === 0 ? <View style={styles.contentFindView}>
                            <Divider style={{backgroundColor: '#EAEAEA', width: '100%'}}/>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    marginBottom: 5,
                                    marginTop: 5,
                                }}>
                                <TouchableOpacity style={{height: 40, width: '90%'}} onPress={() => {
                                    if (config.access_token === 'none') {
                                        this.props.navigation.navigate('LoginIndex');
                                    } else {
                                        this.setState({
                                            popupStatus: true,
                                            autoFocus: true,
                                            text: '',
                                        });
                                        this.commentPlaceholder = null;
                                        this.to_user_id = data.user_id;
                                    }
                                }}>
                                    <View style={{
                                        borderRadius: 15,
                                        height: 40,
                                        width: '100%',
                                        backgroundColor: '#EAEAEA',
                                        justifyContent: 'center'
                                    }}><Text style={{paddingLeft: 10}}>写回复...</Text></View>
                                </TouchableOpacity>
                            </View>
                        </View> : null}
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

const listItemStyle = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingLeft: 10,
        alignItems: "center",
        // justifyContent:'center',
        // width: width
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
        // marginTop: 2,
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
        height: 25
    },
    divider: {
        // flex: 1,
        width: width,
        height: 1,
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
        backgroundColor: 'white'
    },
    container: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderColor: "#dddddd",
        // marginBottom: 10,
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
