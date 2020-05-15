import React, {Component} from 'react';
import {Icon, ListItem, Button} from 'react-native-elements'
import {StyleSheet, View, Text, Dimensions, Image, ScrollView, TouchableOpacity,SafeAreaView} from 'react-native';
import api from "../service/allMembersApi";
import config from "../service/config";
import {Toast, Picker, TextareaItem, Modal, Provider} from '@ant-design/react-native';
import serverConfig from '../service/config';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from "../views/LoadingView";
import imageHeartsNormal from '../images/hearts_normal.png';

let {width} = Dimensions.get('window');

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            matchMakerItems: '请选择求助的问题',
            detail: '',
            loading: true,
            coinViewState: false,
            payCoin: 0,
            coin: 0
        };
        this.init();
    }

    init() {
        const that = this;
        api.getMatchMakerPriceInfo().then(function (params) {
            that.setState({
                loading: false,
                coin: params.coin,
                payCoin: params.payCoin
            });
        }, function (error) {

        }).done();
    }

    _postMatchMaker = () => {
        if (this.state.matchMakerItems === '请选择求助的问题') {
            Toast.info('请选择求助的类型', 1, undefined, false);
        } else if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料', 1, undefined, false);
            this.props.navigation.navigate('EditWdIndex');
        } else if (config.state === '1') {
            this.setState({
                coinViewState: true
            });
        }
    };

    pay() {
        this.setState(
            {
                coinViewState: false,
                loading: true
            }
        );
        const that = this;
        let body = JSON.stringify({
            id: this.props.navigation.state.params.id,
            question: this._getStatusParam(this.state.matchMakerItems, serverConfig.matchMakerItems),
            detail: this.state.detail.trim(),
            payCoin: this.state.payCoin
        });
        api.postMatchMaker(body).then(function (message) {
            that.setState({
                loading: false
            });
            Modal.alert('求助成功', '您的专属红娘已收到，正在为您处理', [{
                text: '知道了', onPress: () => that.props.navigation.goBack()
            }]);
        }, function (error) {
            console.log(error);
        }).done();
    }

    onMatchMakerItemsChange = (value: any) => {
        this.setState({
            matchMakerItems: value.toString(),
        });
    };

    onDetailChange = (value: String) => {
        this.setState({
            detail: value.toString(),
        });
    };

    _getStatusParam = (value, array) => {
        let _index;
        array.map((data, index) => {
            if (data.value === value) {
                _index = index;
            }
        });
        return _index;
    };

    render() {
        const image = {
            width: 20,
            height: 20,
            marginLeft: 10,
            marginRight: 10,
        };
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1}}>
                        {this.state.loading ? (
                            <LoadingView
                                cancel={() => this.setState({loading: false})}
                            />
                        ) : null}
                        <Modal
                            popup
                            onClose={() => this.setState({coinViewState: false})}
                            maskClosable={true}
                            visible={this.state.coinViewState}
                            animationType="slide-up"
                        >
                            <ListItem title={'需支付100枚'} subtitle={'心动币'}/>
                            <ListItem title={this.state.coin + '枚'} subtitle={'我的心动币'} bottomDivider={true}/>
                            {this.state.coin >= this.state.payCoin ?
                                <ListItem
                                    leftElement={<Image style={{width: 20, height: 20}}
                                                        source={require("../images/coins.png")}/>}
                                    title={'支付'}
                                    bottomDivider={true}
                                    onPress={() => {
                                        this.pay()
                                    }}
                                />
                                :
                                <ListItem
                                    leftElement={<Image style={{width: 20, height: 20}}
                                                        source={require("../images/credit-card.png")}/>}
                                    title={'购买心动币'}
                                    bottomDivider={true}
                                    onPress={() => {
                                        this.setState({
                                            coinViewState: false
                                        });
                                        this.props.navigation.navigate('Coin');
                                    }}
                                />
                            }
                            <ListItem
                                leftElement={<Image style={{width: 20, height: 20}}
                                                    source={require("../images/error.png")}/>}
                                title={'取消'}
                                bottomDivider={true}
                                onPress={() => {
                                    this.setState({
                                        coinViewState: false
                                    })
                                }}
                            />
                        </Modal>
                        <CommonTitleBar
                            title={"求助红娘"}
                            nav={this.props.navigation}
                        />
                        <ScrollView>
                            <Picker
                                data={serverConfig.matchMakerItems}
                                cols={1}
                                onChange={this.onMatchMakerItemsChange}
                            >
                                <ListItem
                                    // leftIcon={<Icon
                                    //     name='heart'
                                    //     type='material-community'
                                    //     color='pink'
                                    //     size={20}
                                    //     iconStyle={image}
                                    // />}
                                    leftElement={<Image
                                        source={imageHeartsNormal}
                                        style={{
                                            width: 25,
                                            height: 25
                                        }}
                                    />}
                                    rightTitle={this.state.matchMakerItems}
                                    bottomDivider={true}
                                />
                            </Picker>
                            <TextareaItem rows={4} placeholder="选填,具体需求的描述" count={20} style={{paddingVertical: 5}}
                                          onChange={this.onDetailChange}/>
                        </ScrollView>

                        <View style={styles.contentFindView}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this._postMatchMaker()}>
                                <View style={[styles.loginBtn, {backgroundColor: 'lightcoral'}]}>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginTop: 5,
                                        marginBottom: 5
                                    }}>
                                        <Image style={{width: 30, height: 30, marginRight: 10}}
                                               source={require("../images/cupid.png")}/>
                                        <Text style={{color: "#ffffff", fontSize: 16}}>求助红娘</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Provider>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    contentFindView: {
        flex: 1,
        width: width,
        position: "absolute",
        bottom: 5,
        justifyContent: 'space-around',
        flexDirection: 'row'
    },
    loginBtn: {
        width: width - 20,
        borderRadius: 3,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default Index;
