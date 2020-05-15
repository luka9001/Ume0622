import React, {Component} from 'react';
import {View, Platform,SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import {Toast} from '@ant-design/react-native';
import CommonTitleBar from '../views/CommonTitleBar';
import priceApi from "../service/price";
import {StackActions, NavigationActions} from 'react-navigation';
import LoadingView from "./LoadingView";

const injectedJavascript = `(function() {
  window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
  };
})()`;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
        }
    }

    msg_from_webview_h(orderID) {
        this.setState({
            visible: true
        });
        let that = this;
        priceApi.postPayPalResult(JSON.stringify({
            'order_id': orderID,
            'product': this.props.navigation.state.params.product,
            'price': this.props.navigation.state.params.price,
            'product_type': this.props.navigation.state.params.product_type
        })).then(function (data) {
            Toast.info('支付成功');
            that.props.navigation.dispatch(StackActions.pop({
                n: that.props.navigation.state.params.product_type > 2 ? 1 : 2,
            }));
            that.setState({
                visible: false
            });
        }, function (error) {

        }).done();
    }

    render() {
        const source = (Platform.OS === 'ios') ? null : {uri: 'file:///android_asset/pay.html'}
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <View style={{flex: 1}}>
                    <CommonTitleBar
                        title={'支付'}
                        nav={this.props.navigation}
                        // rightBtnText={this.props.navigation.state.params.type === 0 ? '报名' : null}
                        // handleRightBtnClick={() =>
                        //   this.show()
                        // }
                    />
                    {this.state.visible ? (
                        <LoadingView
                            cancel={() => this.setState({visible: false})}
                        />
                    ) : null}
                    <WebView
                        ref={webView => this.webView = webView}
                        style={{flex: 1}}
                        source={source}
                        javaScriptEnabled={true}
                        injectedJavaScript={injectedJavascript}
                        onMessage={event => {
                            this.msg_from_webview_h(event.nativeEvent.data);
                        }}
                        onLoadEnd={() => {
                            this.setState({visible: false});
                            this.webView.postMessage([this.props.navigation.state.params.product, this.props.navigation.state.params.price]);
                        }}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

export default Index;
