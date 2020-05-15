import React, {Component} from 'react';
import {View, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import {Modal, Provider} from '@ant-design/react-native';
import CommonTitleBar from './CommonTitleBar';
import LoadingView from "./LoadingView";

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            signup: false
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1}}>
                        <CommonTitleBar
                            title={this.props.navigation.state.params.title}
                            nav={this.props.navigation}
                        />
                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}
                        <WebView
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
