import React, {Component} from 'react';
import {Icon, Badge, Divider} from 'react-native-elements';
import {
    Text,
    View,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    PixelRatio,
    Image,
    SafeAreaView
} from 'react-native';
import api from "../service/socialApi";
import config from "../service/config";
import {RecyclerListView, LayoutProvider, DataProvider} from "recyclerlistview";
import Global from "../util/Global";
import LoadingView from "../views/LoadingView";

let {width} = Dimensions.get('window');

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            list: [],
            infoList: [],
            loading: false,
            isLoadMore: false,
            loadMoreText: '',
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
                dim.height = 61;
            }
        );
    }

    componentDidMount() {
        this._getCommentsCount();
    }

    _onItemPress(id, name) {
        this.props.navigation.navigate('PlContent', {id, name});
    }

    _getCommentsCount() {
        this.page = 1;
        const that = this;
        api.getCommentsCount(this.page).then(
            function (message) {
                if (message.code === 200) {
                    that.setState({
                        infoList: message.data.data
                    });
                }
                that.setState({
                    visible: false,
                    loading: false
                });
            }, function (error) {

            }
        ).done();
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
        let avatar = {uri: config.host + lifephotos[0]}
        return (
            <TouchableOpacity onPress={() => {
                this._onItemPress(data.id, data.name);
            }}>
                <View key={data.id} style={{backgroundColor: 'white'}}>
                    <View style={listItemStyle.container}>
                        <TouchableOpacity onPress={() => {
                            this.gotoDetail(data.id)
                        }}>
                            <Image style={listItemStyle.avatar} source={avatar}/>
                        </TouchableOpacity>

                        <View style={listItemStyle.content}>
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
                        </View>
                        <View style={{flexDirection: 'column', justifyContent: 'center', height: 40}}>
                            <Badge status="success" value={data.count}
                                   textStyle={{color: 'white', textAlign: 'center'}}/>
                        </View>
                    </View>
                    <View style={listItemStyle.divider}/>
                </View>
                <Divider style={{backgroundColor: '#EAEAEA', width: '100%'}}/>
            </TouchableOpacity>
        );
    };

    _onLoadMore = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        this._getMoreComments(mdata.data.id);
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <View style={{flex: 1}}>
                    <RecyclerListView
                        layoutProvider={this._layoutProvider}
                        dataProvider={this.dataProvider.cloneWithRows(this.state.infoList)}
                        rowRenderer={this.renderItem}
                        extendedState={this.state}
                        onEndReached={this._onLoadMore}
                        onEndReachedThreshold={50}
                        scrollViewProps={{
                            refreshControl: (
                                <RefreshControl
                                    refreshing={this.state.loading}
                                    onRefresh={async () => {
                                        this.setState({loading: true});
                                        await this._getCommentsCount();
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
            </SafeAreaView>
        );
    }
}

const listItemStyle = StyleSheet.create({
    container: {
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
        height: 40,
        flexDirection: "column",
        justifyContent: 'center',
        marginLeft: 10,
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

export default Index;
