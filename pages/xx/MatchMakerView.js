import React, {Component} from 'react';
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
    SafeAreaView
} from 'react-native';
import TimeUtils from "../util/TimeUtil";
import {Modal, TextareaItem, Toast, Provider, Card} from "@ant-design/react-native";
import api from '../service/socialApi';
import Global from "../util/Global";
import Utils from '../util/Utils';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from "../views/LoadingView";
import MatchMakerApi from "../service/MatchMakerApi";
import mdata from "../util/cache";

let {width} = Dimensions.get('window');
const url = config.host;

class MatchMakerView extends Component {
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
        this._getMatchMakerPage();
    }

    onSubmit = () => {
        this.setState({
            visible: true
        });
        if (Utils.isEmpty(this.state.text.trim())) {
            Toast.info('请填写回复内容！', 1, undefined, false);
        } else {
            let _text = this.state.text;
            if (!Utils.isEmpty(this.commentPlaceholder)) {
                _text = this.commentPlaceholder + ' ' + this.state.text;
            }
            this._postComment(this.social_message_id, _text, this.to_user_id);
        }
    };

    _getQuestionDetail = (index) => {
        return config.matchMakerItems[index].value;
    };

    pushMatchMakerLogChatView = (type, data) => {
        // this.getDataById(id);
        mdata.data = data;
        mdata.type = type;
        // mdata.rowHeight = this.getRowHeight(type);
        this.props.navigation.navigate('MatchMakerLogView');
    };

    getDataById = (id) => {
        this.state.infoList.map(function (_item, index) {
            if (_item.id === id) {
                mdata.data = _item;
            }
        });
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

    renderCardItem = (type, data) => {
        let isMale = data.sex;
        let lifephotos = JSON.parse(data.lifephoto);
        let thumb = url + lifephotos[0];
        return (
            <TouchableOpacity style={{width: width, justifyContent: 'center'}}
                              onPress={() => this.pushMatchMakerLogChatView(type, data)}>
                <Card style={{margin: 10}}>
                    <Card.Header
                        title={data.name}
                        thumbStyle={{width: 30, height: 30, borderRadius: 5}}
                        thumb={thumb}
                        extra={this.getSexItem(data)}
                    />
                    <Card.Body>
                        <View>
                            <Text style={{marginLeft: 16, fontSize: 16}}>{this._getQuestionDetail(data.question)}</Text>
                        </View>
                    </Card.Body>
                    <Card.Footer
                        content={TimeUtils.getFormattedTime(data.created_at)}
                        extra={data.status === 0 ? <Text style={{color: '#19AD17', textAlign: 'right'}}>点击进入</Text> :
                            <Text style={{color: 'red', textAlign: 'right'}}>已结束</Text>}
                    />
                </Card>
            </TouchableOpacity>
        );
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this.getMoreMatchMakerPage();
    };

    _renderFooter = () => {
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
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

    _postComment = (social_message_id, comment, to_user_id) => {
        const that = this;
        const params = JSON.stringify({social_message_id, comment, to_user_id});
        api.postComment(params).then(function (message) {
            if (message.code === 200) {
                that._getMatchMakerLogPage(social_message_id);
                that.setState({
                    commentcount: that.state.commentcount + 1
                });
            } else {
                Toast.info('发生错误！请联系客服！', 1, undefined, true);
            }
            that.setState({
                // visible: false,
                popupStatus: false,
            });
        }, function (error) {

        }).done();
    };

    _getMatchMakerPage = () => {
        this.page = 1;
        const that = this;
        MatchMakerApi.getMatchMakerPage(this.page).then(function (message) {
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

    getMoreMatchMakerPage = () => {
        this.page = this.page + 1;
        const that = this;
        // Toast.info('正在加载更多...', 1, undefined, false);
        MatchMakerApi.getMatchMakerPage(this.page).then(function (message) {
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

    gotoDetail = (id) => {
        this.props.navigation.navigate('DetailIndex', {id});
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1, backgroundColor: Global.pageBackgroundColor}}>
                        <CommonTitleBar title={'求助红娘'} nav={this.props.navigation}/>
                        <RecyclerListView
                            forceNonDeterministicRendering
                            layoutProvider={this._layoutProvider}
                            dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}
                            rowRenderer={this.renderCardItem}
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
                                            await this._getMatchMakerPage();
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

export default MatchMakerView;
