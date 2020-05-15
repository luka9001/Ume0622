import React, {Component} from "react";
import Utils from "../util/Utils";
import Global from '../util/Global';

import {
    Button,
    Dimensions,
    Image,
    PixelRatio,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import KeyboardTrackingView from "react-native-keyboard-tracking-view/src/KeyboardTrackingView.android";

const BAR_STATE_SHOW_KEYBOARD = 1;
const BAR_STATE_SHOW_RECORDER = 2;
let {width} = Dimensions.get('window');
export default class ChatBottomBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            barState: BAR_STATE_SHOW_KEYBOARD,
            showEmojiView: false,
            showMoreView: false,
            inputMsg: "",
            height: {height: 50},
        };
    }

    render() {
        let barState = this.state.barState;
        switch (barState) {
            case BAR_STATE_SHOW_KEYBOARD:
                return this.renderKeyBoardView();
            case BAR_STATE_SHOW_RECORDER:
                return this.renderRecorderView();
        }
    }

    appendMsg(msg) {
        let s = this.state.inputMsg;
        s += msg;
        this.setState({inputMsg: s});
    }

    renderKeyBoardView() {
        return (
            <View style={[styles.container, {flexGrow: 0}]}>
                {/* <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.handlePress.bind(this, "soundBtn")}
        >
          <Image
            style={styles.icon}
            source={require("../images/ic_chat_sound.png")}
          />
        </TouchableOpacity> */}

                <TextInput
                    value={this.state.inputMsg}
                    onChangeText={text => {
                        this.setState({inputMsg: text});
                    }}
                    style={styles.input}
                    multiline={true}
                />

                {/* <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.handlePress.bind(this, "emojiBtn")}
        >
          <Image
            style={styles.icon}
            source={require("../images/ic_chat_emoji.png")}
          />
        </TouchableOpacity> */}
                {/* {Utils.isEmpty(this.state.inputMsg) ? (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.handlePress.bind(this, "moreBtn")}
          >
            <Image
              style={[styles.icon, { marginLeft: 10 }]}
              source={require("../images/ic_chat_add.png")}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ marginLeft: 10 }}>
            <Button
              color={"#49BC1C"}
              title={"发送"}
              onPress={() => this.sendMsg()}
            />
          </View>
        )} */}


                <TouchableOpacity style={{marginRight:5}} activeOpacity={0.6} onPress={() => {
                    if (!Utils.isEmpty(this.state.inputMsg.trim())) {
                        this.sendMsg()
                    }
                }}>
                    <View style={{
                        backgroundColor: '#49BC1C',
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
        );
    }

    sendMsg() {
        if (this.props.vip_level === 0 && this.props.sex === 0) {
            this.props.nav.navigate('Price');
        } else {
            let onSendBtnClickListener = this.props.handleSendBtnClick;
            if (!Utils.isEmpty(onSendBtnClickListener)) {
                onSendBtnClickListener(this.state.inputMsg);
            }
            this.setState({inputMsg: ""});
        }
    }

    renderRecorderView() {
        return (
            <KeyboardTrackingView
                addBottomView
                manageScrollView
                scrollBehavior={2} // KeyboardTrackingScrollBehaviorFixedOffset
                style={styles.trackingView}
                requiresSameParentToManageScrollView>
                <View style={styles.container}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={this.handlePress.bind(this, "soundBtn")}
                    >
                        <Image
                            style={styles.icon}
                            source={require("../images/ic_chat_keyboard.png")}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.5} style={{flex: 1}}>
                        <View style={styles.recorder}>
                            <Text>按住 说话</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={this.handlePress.bind(this, "emojiBtn")}
                    >
                        <Image
                            style={styles.icon}
                            source={require("../images/ic_chat_emoji.png")}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={this.handlePress.bind(this, "moreBtn")}
                    >
                        <Image
                            style={[styles.icon, {marginLeft: 10}]}
                            source={require("../images/ic_chat_add.png")}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardTrackingView>
        );
    }

    handlePress = tag => {
        if ("soundBtn" == tag) {
            if (this.state.barState === BAR_STATE_SHOW_KEYBOARD) {
                this.setState({
                    barState: BAR_STATE_SHOW_RECORDER,
                    showEmojiView: false,
                    showMoreView: false
                });
            } else if (this.state.barState === BAR_STATE_SHOW_RECORDER) {
                this.setState({
                    barState: BAR_STATE_SHOW_KEYBOARD,
                    showEmojiView: false,
                    showMoreView: false
                });
            }
            this.props.updateView(false, false);
        } else if ("emojiBtn" == tag) {
            var showEmojiView = this.state.showEmojiView;
            this.props.updateView(!showEmojiView, false);
            this.setState({
                showEmojiView: !showEmojiView,
                showMoreView: false
            });
        } else if ("moreBtn" == tag) {
            var showMoreView = this.state.showMoreView;
            var showEmojiView = this.state.showEmojiView;
            this.props.updateView(false, !showMoreView);
            this.setState({
                showEmojiView: false,
                showMoreView: !showMoreView
            });
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        minHeight: 50,
        maxHeight: 150,
        alignItems: "center",
        backgroundColor: Global.pageBackgroundColor,
        paddingLeft: 10,
        paddingRight: 10
    },
    input: {
        fontSize: 20,
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 3,
        borderWidth: 5,
        borderColor: 'white'
        // minHeight: 40,
        // marginTop: 5,
        // marginBottom: 5
    },
    icon: {
        width: 40,
        height: 40,
        padding: 5
    },
    recorder: {
        flex: 1,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1 / PixelRatio.get(),
        borderColor: "#6E7377",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    trackingView: {
        ...Platform.select({
            ios: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0
            }
        })
    }
});
