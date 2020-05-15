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
    Modal, ScrollView, Platform, TextInput,SafeAreaView
} from 'react-native';
import config from "../service/config";
import mdata from "../util/cache";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import TimeUtils from "../util/TimeUtil";
import {Modal as AntmModal, Provider, TextareaItem, Toast} from "@ant-design/react-native";
import api from '../service/socialApi';
import Global from "../util/Global";
import Utils from '../util/Utils';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from "../views/LoadingView";
import ImageViewer from "react-native-image-zoom-viewer";
import utilsApi from "../service/utilsApi";
import StorageUtil from "../util/StorageUtil";
import FastImage from 'react-native-fast-image';
import VipLevelView from '../views/VipLevelView';
import {Download} from "../util/DownloadToCamera";
import {KeyboardTrackingView} from "react-native-keyboard-tracking-view";
import GlobalStyles from "../styles/Styles";

let {height, width} = Dimensions.get('window');
const url = config.host;
export default class Index extends Component {
    componentDidMount() {
        if (this.state.infoList.length === 0) {
            this._getComments(mdata.data.id);
        }

        this.rowHeight = mdata.rowHeight;
        const that = this;
        StorageUtil.get('check_status', function (error, object) {
            if (object !== null) {
                that.setState({
                    checkStatus: object
                })
            }
        })
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
            checkStatus: 0
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
            this._postComment(data.id, _text, this.to_user_id);
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
        const text = {
            fontSize: 12,
            color: "#969696"
        };
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        let avatar = {uri: url + lifephotos[0]};
        return (
            <TouchableOpacity onPress={() => {
                this.setState({
                    popupStatus: true,
                    autoFocus: true
                });
                this.commentPlaceholder = '@' + data.name + ' ';
                this.to_user_id = data.from_user_id;
            }}>
                <View style={listItemStyle.container}>
                    <TouchableOpacity onPress={() => {
                        this.gotoDetail(data.from_user_id)
                    }} style={{height: 74}}>
                        <FastImage style={listItemStyle.avatar} source={avatar}/>
                    </TouchableOpacity>
                    <View style={listItemStyle.content}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                            <VipLevelView vipLevel={data.vip_level} style={{width: 30, height: 30}}/>
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
                        <Text style={listItemStyle.msgText}>
                            {data.comment + '\n'}
                        </Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}}>
                            <Text style={listItemStyle.timeText}>
                                {TimeUtils.getFormattedTime(data.created_at)}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={{top: 10}} onPress={() => {
                        if (data.is_current_user === 1) {
                            this.setState({deleteViewStatus: true, reportID: data.id})
                        } else {
                            this.setState({reportViewStatus: true, reportID: data.id})
                        }
                    }}>
                        <Icon
                            name='dots-vertical'
                            type='material-community'
                            color='#6E7991'
                            size={20}
                        />
                    </TouchableOpacity>
                </View>
                <Divider style={{backgroundColor: '#EAEAEA', width: width}}/>
            </TouchableOpacity>
        );
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this._getMoreComments(mdata.data.id);
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

    onClose2 = () => {
        this.setState({
            popupStatus: false,
            autoFocus: false
        });
    };

    _postLike = (social_message_id) => {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else {
            const that = this;
            const params = JSON.stringify({social_message_id})
            api.postLike(params).then(function (message) {
                if (message.code === 200) {
                    that.setState({
                        likescount: that.state.likescount + 1
                    });
                } else {
                    Toast.info('发生错误！请联系客服！', 1, undefined, true);
                }
            }).done();
        }
    };

    _postComment = (social_message_id, comment, to_user_id) => {
        const that = this;
        const params = JSON.stringify({social_message_id, comment, to_user_id});
        api.postComment(params).then(function (message) {
            if (message.code === 200) {
                that._getComments(social_message_id);
                that.setState({
                    // commentcount: that.state.commentcount + 1,
                    text: ''
                });
            } else {
                Toast.info('发生错误！请联系客服！', 1, undefined, true);
            }
            that.setState({
                // visible: false,
                popupStatus: false,
            });
        }, function (error) {
            that.setState({
                popupStatus: false,
            });
            Toast.info('发生错误！请联系客服！', 1, undefined, true);
        }).done();
    };

    _getComments = (social_message_id) => {
        this.page = 1;
        const that = this;
        api.getComments(this.page, JSON.stringify({social_message_id})).then(function (message) {
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
                    commentcount: message.data.total
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

    _getMoreComments = (social_message_id) => {
        this.page = this.page + 1;
        const that = this;
        // Toast.info('正在加载更多...', 1, undefined, false);
        api.getComments(this.page, JSON.stringify({social_message_id})).then(function (message) {
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
                    infoList: that.state.infoList.concat(_list),
                    commentcount: message.data.total
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
                    visible: false,
                    // commentcount: that.state.commentcount - 1
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
        this._getComments(mdata.data.id);
    }

    _postReport(params) {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else {
            let that = this;
            this.setState({visible: true});
            utilsApi.postReport(params).then(
                function (params) {
                    Toast.info('举报成功', 1, undefined, false);
                    that.setState({
                        reportViewStatus: false,
                        visible: false
                    });
                }, function (error) {
                    that.setState({
                        reportViewStatus: false,
                        visible: false
                    });
                }
            ).done();
        }
    }

    renderLoad() { //这里是写的一个loading
        return (
            <View style={{marginTop: (height / 2) - 20}}>
                <ActivityIndicator animating={true} size={"large"}/>
            </View>
        )
    }

    render() {
        const dt = {
            fontSize: 18,
            backgroundColor: '#FFFFFF'
        };
        const name = {
            fontSize: 20
        };
        const text = {
            marginRight: 8,
            fontSize: 12,
            color: "#969696"
        };

        let data = mdata.data;
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        let photos = JSON.parse(data.photos);

        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        <Modal visible={this.state.imageViewerStatus} transparent={true}>
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
                            title={'动态详情'}
                            nav={this.props.navigation}
                        />
                        <TouchableOpacity onPress={() => {
                            this.gotoDetail(data.user_id)
                        }}>
                            <View style={styles.container}>
                                <FastImage style={{
                                    borderRadius: 5, top: 10, marginLeft: '2%', width: 50,
                                    height: 50
                                }} source={{
                                    uri:
                                        url + lifephotos[0],
                                }}/>
                                <View style={{width: width * 0.7, marginLeft: '2%', top: 10}}>
                                    <View>
                                        <View
                                            style={{height: 30, flexDirection: 'row', justifyContent: 'space-between'}}>
                                            {/*<Text style={name}>{data.name}</Text>*/}
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                <Text style={name}>{data.name}</Text>
                                                <VipLevelView vipLevel={data.vip_level}
                                                              style={{width: 40, height: 40, marginLeft: 5}}/>
                                            </View>
                                        </View>
                                        <View style={{marginTop: 5, flexDirection: 'row', alignItems: 'flex-start'}}>
                                            {isMale === 0 ? <Icon
                                                name='gender-male'
                                                type='material-community'
                                                color='#6495ED'
                                                size={15}
                                            /> : <Icon
                                                name='gender-female'
                                                type='material-community'
                                                color='#EE6A50'
                                                size={15}
                                            />}
                                            <Text style={text}>{data.live}</Text>
                                            <Text style={text}>{TimeUtils.getFormattedTime(data.created_at)}</Text>
                                        </View>
                                        <View style={{flexDirection: 'column'}}>
                                            <Text style={dt}>
                                                {data.message + '\n'}
                                            </Text>
                                            {this.renderImages(photos)}
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginTop: 15
                                            }}>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {/*<View style={{marginRight: 5, top: 10}}>*/}
                                {/*    <Icon*/}
                                {/*        name='dots-vertical'*/}
                                {/*        type='material-community'*/}
                                {/*        color='#6E7991'*/}
                                {/*        size={20}*/}
                                {/*    />*/}
                                {/*</View>*/}
                            </View>
                        </TouchableOpacity>
                        <View style={{padding: 10}}><Text style={{fontSize: 16}}>所有回复</Text></View>
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
                                            await this._getComments(data.id);
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
                            {/*<KeyboardAwareScrollView*/}
                            {/*    //{...scrollPersistTaps}*/}
                            {/*    // style={style}*/}
                            {/*    contentContainerStyle={{flex: 1}}*/}
                            {/*    // scrollEnabled={scrollEnabled}*/}
                            {/*    alwaysBounceVertical={false}*/}
                            {/*    keyboardVerticalOffset={128}*/}
                            {/*    // extraHeight={keyboardVerticalOffset}*/}
                            {/*    behavior='position'*/}
                            {/*>*/}
                            <KeyboardTrackingView
                                addBottomView
                                manageScrollView
                                scrollBehavior={2} // KeyboardTrackingScrollBehaviorFixedOffset
                                style={styles.trackingView}
                                requiresSameParentToManageScrollView
                                // bottomViewColor={themes[theme].messageboxBackground}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'white'
                                    }}>
                                    <TextInput
                                        ref={(input) => this.input = input}
                                        value={this.state.text}
                                        onChangeText={text => {
                                            this.setState({text});
                                        }}
                                        style={{
                                            padding: 5,
                                            fontSize: 20,
                                            flex: 1,
                                            backgroundColor: 'white',
                                            borderRadius: 3,
                                            margin: 5,
                                            borderWidth: 1,
                                            borderColor: 'white',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        placeholder={this.commentPlaceholder}
                                        selectionColor={GlobalStyles.inputSelectedColor}
                                        multiline={true}
                                        maxLength={100}
                                        autoFocus={this.state.autoFocus}
                                    />
                                    <TouchableOpacity style={{marginLeft: 10}} activeOpacity={0.6}
                                                      onPress={() => this.onSubmit()}>
                                        <View style={{
                                            backgroundColor: 'pink',
                                            height: 40,
                                            width: width / 6,
                                            borderRadius: 3,
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}>
                                            <Text style={{
                                                color: "#ffffff",
                                                fontSize: 16,
                                                // marginBottom: 5
                                            }}>发送</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardTrackingView>
                        </AntmModal>

                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}

                        <View style={styles.contentFindView}>
                            <Divider style={{backgroundColor: '#EAEAEA', width: '100%'}}/>
                            <View
                                style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 5, marginTop: 5}}>
                                <TouchableOpacity style={{height: 40, width: '70%', marginLeft: 10}} onPress={() => {
                                    if (config.access_token === 'none') {
                                        this.props.navigation.navigate('LoginIndex');
                                    } else if (this.state.checkStatus === 0) {
                                        AntmModal.alert('提醒', '您的资料将在24小时内审核完毕', [{text: '知道了'}])
                                    } else if (this.state.checkStatus === 2) {
                                        AntmModal.alert('提醒', '很遗憾，您的资料未通过审核', [{text: '取消'}, {
                                            text: '前往修改', onPress: () => this.props.navigation.navigate('EditWdIndex')
                                        }])
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
                                        width: '90%',
                                        backgroundColor: '#EAEAEA',
                                        justifyContent: 'center'
                                    }}><Text style={{paddingLeft: 10}}>写回复...</Text></View>
                                </TouchableOpacity>
                                <View style={{justifyContent: 'center'}}>
                                    <TouchableOpacity onPress={() => {
                                        this._postLike(data.id)
                                    }} style={{flexDirection: 'row', justifyContent: 'space-between', marginRight: 10}}>
                                        <Icon
                                            name='thumb-up-outline'
                                            type='material-community'
                                            color="#6E7991"
                                            containerStyle={listItemStyle.commentImg}
                                        />
                                        <Text style={listItemStyle.countText}>
                                            {this.state.likescount}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{justifyContent: 'center'}}>
                                    <TouchableOpacity onPress={() => {
                                        if (config.access_token === 'none') {
                                            this.props.navigation.navigate('LoginIndex');
                                        } else if (this.state.checkStatus === 0) {
                                            AntmModal.alert('提醒', '您的资料将在24小时内审核完毕', [{text: '知道了'}])
                                        } else if (this.state.checkStatus === 2) {
                                            AntmModal.alert('提醒', '很遗憾，您的资料未通过审核', [{text: '取消'}, {
                                                text: '前往修改',
                                                onPress: () => this.props.navigation.navigate('EditWdIndex')
                                            }])
                                        } else {
                                            this.setState({
                                                popupStatus: true,
                                                autoFocus: true,
                                                text: ''
                                            });
                                            this.commentPlaceholder = null;
                                            this.to_user_id = data.user_id;
                                        }
                                    }} style={{flexDirection: 'row', justifyContent: 'space-between', marginRight: 10}}>
                                        <Icon
                                            name='comment-processing-outline'
                                            type='material-community'
                                            containerStyle={listItemStyle.commentImg}
                                            color="#6E7991"
                                        />
                                        <Text style={listItemStyle.countText}>
                                            {this.state.commentcount}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

const listItemStyle = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        // height: 94,
        width: width,
        // display: 'flex',
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
        marginLeft: 5,
        marginRight: 8,
        fontSize: 15,
        color: "#54688D"
    },
    msgText: {
        fontSize: 15,
        color: "#000000",
        marginTop: 2,
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
    trackingView: {
        ...Platform.select({
            ios: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
            }
        })
    }
});
