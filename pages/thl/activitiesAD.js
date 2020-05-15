import React, {Component} from 'react';
import {View,SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import {Toast, Modal, Provider} from '@ant-design/react-native';
import {ListItem} from "react-native-elements";
import CommonTitleBar from '../views/CommonTitleBar';
import api from '../service/ad';
import config from "../service/config";
import LoadingView from "../views/LoadingView";

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            signup: false
        }
    }

    show() {
        this.setState({signup: true});
    }

    signup() {
        if (config.access_token === 'none') {
            this.props.navigation.navigate('LoginIndex');
            this.setState({signup: false});
        } else if (config.state !== '1') {
            this.props.navigation.navigate('EditWdIndex');
            this.setState({signup: false});
        } else {
            let ad_id = this.props.navigation.state.params.id;
            let that = this;
            let nav = this.props.navigation;
            that.setState({visible: true});
            api.postSignUp(JSON.stringify({
                ad_id
            })).then(function (params) {
                that.setState({visible: false});
                that.setState({signup: false});
                if (params.code === 202) {
                    Toast.info('人数已满');
                } else {
                    Toast.info('报名成功');
                    that.props.navigation.goBack();
                }
            }, function (error) {
                that.setState({visible: false});
                that.setState({signup: false});
                Toast.info('您已成功报名');
            }).done();
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1}}>
                        <CommonTitleBar
                            title={this.props.navigation.state.params.type === 0 ? '官方活动' : '广告'}
                            nav={this.props.navigation}
                            rightBtnText={this.props.navigation.state.params.type === 0 ? '报名' : null}
                            handleRightBtnClick={() =>
                                this.show()
                            }
                        />
                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}
                        <Modal
                            transparent
                            visible={this.state.signup}
                            animationType="slide-up"
                        >
                            <ListItem
                                title={'我要报名'}
                                titleStyle={{textAlign: 'center'}}
                                bottomDivider={true}
                                onPress={() => this.signup()}
                            />
                            <ListItem
                                title={'取消'}
                                titleStyle={{textAlign: 'center'}}
                                onPress={() => {
                                    this.setState({
                                        signup: false
                                    })
                                }}
                            />
                        </Modal>
                        <WebView
                            // useWebKit={true}
                            style={{flex: 1}}
                            source={{uri: this.props.navigation.state.params.url}}
                            onLoadEnd={() => {
                                this.setState({visible: false})
                            }}
                        />
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

export default Index;
