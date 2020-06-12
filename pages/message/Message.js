import React, {Component} from 'react';
import TitleBar from '../views/TitleBar';

import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    PixelRatio,
    FlatList,
    TouchableHighlight,
    SafeAreaView,
    DeviceEventEmitter, TouchableOpacity,
} from 'react-native';
import config from '../service/config';

import Global from '../util/Global';
import Utils from '../util/Utils';
import ImageAdapter from '../views/ImageAdapter';
import TimeUtil from '../util/TimeUtil';

import {withNavigationFocus} from 'react-navigation';
import FastImage from 'react-native-fast-image';

import IMDB from '../util/IMDB';
import LogUtil from '../util/LogUtil';
import StorageUtil from '../util/StorageUtil';
import {Icon} from 'react-native-elements';
import {BadgeItem} from '../views/BadgeItem';

const {width} = Dimensions.get('window');

class Button extends React.Component {
    render() {
        return <TouchableOpacity
            onPress={this.props.onPress}
            underlayColor='#e4083f'
            activeOpacity={0.5}
        >
            <View
                style={{height: 50, borderRadius: 5, borderWidth: 1}}>
                <Text
                    style={{textAlign: 'center'}}>
                    {this.props.title}
                </Text>
            </View>
        </TouchableOpacity>;
    }
}

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            checkedUpgrade: true, // 标记是否检查了更新，这里置为true则不会检查更新，设置为false则每次启动时检查更新，该功能默认不开启
            recentConversation: [],
        };
    }

    queryChatHistory() {
        StorageUtil.get('hasLogin', (error, object) => {
            if (!error && object != null && object.hasLogin) {
                IMDB.queryChatHistory((chatList) => {
                    LogUtil.d('最后一条信息', chatList);
                    this.setState({
                        recentConversation: chatList,
                    });
                });
            } else {
                this.setState({
                    recentConversation: [],
                });
            }
        });
    }

    addListener() {
        this.appLogin = DeviceEventEmitter.addListener('appLogin', (data) => {
            this.queryChatHistory();
        });
        this.unread = DeviceEventEmitter.addListener('unread', (data) => {
            this.queryChatHistory();
        });
        //im消息
        this.onmessage = DeviceEventEmitter.addListener('onmessage', (data) => {
            this.queryChatHistory();
        });

        this.setDisturbResult = DeviceEventEmitter.addListener('setDisturbResult', (data) => {
            this.queryChatHistory();
        });

        this.logout = DeviceEventEmitter.addListener('logout', (data) => {
            this.setState({
                recentConversation: [],
            });
        });
    }

    componentDidMount(): void {
        //后续增加登录后再执行
        this.addListener();
        this.queryChatHistory();
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                {/*<Button title="query"*/}
                {/*        onPress={() =>  IMDB.queryChatHistory((lastMsg)=>{*/}
                {/*            console.log('最后一条信息',lastMsg);*/}
                {/*        })*/}
                {/*        }/>*/}
                {/*<Button title="create"*/}
                {/*        onPress={() =>  IMDB.createTable()*/}
                {/*        }/>*/}
                {/*<Button title="drop"*/}
                {/*        onPress={() =>  IMDB.dropTable()*/}
                {/*        }/>*/}
                <View style={styles.container}>
                    <TitleBar title={'消息'} nav={this.props.navigation} isfilter={false}/>
                    <View style={styles.divider}/>
                    <View style={styles.content}>
                        <FlatList
                            extraData={this.state}
                            data={this.state.recentConversation}
                            renderItem={this._renderItem}
                            keyExtractor={this._keyExtractor}
                        />
                    </View>
                    <View style={styles.divider}/>
                    <View
                        style={{
                            backgroundColor: 'transparent',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: width,
                        }}
                    >
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    _keyExtractor = (item, index) => 'conversation-' + index;

    resetUnreadCount(from_client_name) {
        IMDB.updateUnreadCout(from_client_name, (result) => {
            this.queryChatHistory();
        });
    }

    _renderItem = ({item}) => {
        let type = item['type'];
        let contactId = item['from_client_name'];
        let avatar = config.host + '/api/v1/img/' + item['from_client_name'];
        let nick = item['from_client_nickname'];
        let lastMsgContent = item['content'];
        return (
            <View style={{flex: 1}}>
                <TouchableHighlight
                    underlayColor={Global.touchableHighlightColor}
                    onPress={() => {
                        this.resetUnreadCount(contactId);
                        this.props.navigation.navigate('Chatting', {
                            from_client_id: item['from_client_id'],
                            contactId: contactId,
                            name: nick,
                            avatar: avatar,
                            type: type,
                        });
                    }}
                >
                    <View style={styles.listItemContainer}>
                        {typeof (avatar) != 'string' ? <ImageAdapter path={avatar} width={50} height={50}/> :
                            <View><FastImage style={{width: 50, height: 50, borderRadius: 5}}
                                             source={{uri: avatar, headers: {Authorization: config.access_token}}}/>
                                {BadgeItem(item.unreadCount)}
                            </View>
                        }
                        <View style={styles.listItemTextContainer}>
                            <View style={styles.listItemSubContainer}>
                                <Text numberOfLines={1} style={styles.listItemTitle}>
                                    {nick}
                                </Text>
                                <Text numberOfLines={1} style={styles.listItemTime}>
                                    {TimeUtil.formatWebSocketMessageTime(item['time'])}
                                </Text>
                            </View>
                            <View style={styles.listItemSubContainer}>
                                <Text numberOfLines={1} style={styles.listItemSubtitle}>
                                    {lastMsgContent}
                                </Text>
                                {
                                    item['to_id'] !== null ? <Icon name={'bell-off-outline'} type={'material-community'}
                                                                   iconStyle={{
                                                                       backgroundColor: 'white',
                                                                       color: '#999999',
                                                                   }}
                                                                   size={20}/> : null
                                }
                            </View>
                        </View>
                    </View>
                </TouchableHighlight>
                <View style={styles.divider}/>
            </View>
        );
    };

    unregisterListeners() {
        this.appLogin.remove();
        this.unread.remove();
        this.onmessage.remove();
        this.setDisturbResult.remove();
        this.logout.remove();
    }

    componentWillUnmount() {
        this.unregisterListeners();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        width: width,
        height: 1 / PixelRatio.get(),
        backgroundColor: Global.dividerColor,
    },
    content: {
        flex: 1,
        width: width,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Global.pageBackgroundColor,
    },
    listItemContainer: {
        flexDirection: 'row',
        width: width,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    listItemTextContainer: {
        flexDirection: 'column',
        flex: 1,
        paddingLeft: 15,
    },
    listItemSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listItemTitle: {
        color: '#333333',
        fontSize: 16,
        flex: 1,
    },
    listItemTime: {
        color: '#999999',
        fontSize: 12,
    },
    listItemSubtitle: {
        color: '#999999',
        fontSize: 14,
        marginTop: 3,
        flex: 1,
    },
    redDot: {
        borderRadius: 90,
        width: 20,
        height: 20,
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    redDotText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    emptyHintText: {
        fontSize: 18,
        color: '#999999',
    },
});

export default withNavigationFocus(Index);
