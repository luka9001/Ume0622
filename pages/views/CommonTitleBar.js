import React, {Component} from "react";
import Global from "../util/Global";
import Utils from "../util/Utils";
import {
    Button,
    Dimensions,
    Image,
    PixelRatio,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from "react-native";
import {Icon} from "react-native-elements";
import GlobalStyles from "../styles/Styles";

const {width, height} = Dimensions.get("window");

const X_WIDTH = 375;
const X_HEIGHT = 812;

export default class CommonTitleBar extends Component {
    constructor(props) {
        super(props);
    }

    isIphoneX() {
        return (
            Platform.OS === "ios" &&
            ((height === X_HEIGHT && width === X_WIDTH) ||
                (height === X_WIDTH && width === X_HEIGHT))
        );
    }

    renderAndroid() {
        return (
            <View style={styles.container}>
                {/*<StatusBar backgroundColor="#393A3E" barStyle="light-content"/>*/}
                <View style={styles.content}>
                    {/*<TouchableOpacity activeOpacity={0.5} onPress={this.handleBackClick}>*/}
                    {/*  <Image*/}
                    {/*    source={require("../images/ic_back.png")}*/}
                    {/*    style={styles.backBtn}*/}
                    {/*  />*/}
                    {/*</TouchableOpacity>*/}
                    <Icon name={'arrow-left'} type={'material-community'} onPress={this.handleBackClick}
                          containerStyle={styles.backBtn} size={25}/>
                    <View style={styles.btnDivider}/>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{this.props.title}</Text>
                        {Utils.isEmpty(this.props.rightSecondBtn) ? null : this.props.rightSecondBtn}
                        {Utils.isEmpty(this.props.rightIcon) ? null :
                            <Icon name={this.props.rightIcon} type={'material-community'}
                                  onPress={() => this.handleRightClick()} containerStyle={styles.backBtn} size={25}/>
                        }
                        {Utils.isEmpty(this.props.rightBtnText) ? null : (
                            <TouchableOpacity style={{marginRight: 5}} activeOpacity={0.6}
                                              onPress={() => this.props.handleRightBtnClick()}>
                                <View style={{
                                    // backgroundColor: '#49BC1C',
                                    backgroundColor: GlobalStyles.btnColor,
                                    height: 35,
                                    width: width / 8,
                                    borderRadius: 3,
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        color: "#ffffff",
                                        fontSize: 16,
                                        // marginBottom: 5
                                    }}>{this.props.rightBtnText}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    }

    renderIOS() {
        let h = 20;
        if (this.isIphoneX()) {
            h = 35;
        }
        return (
            <View style={styles.container}>
                {/*<View*/}
                {/*    style={{height: h, backgroundColor: Global.titleBackgroundColor}}*/}
                {/*/>*/}
                <View style={styles.content}>
                    <Icon name={'arrow-left'} type={'material-community'} onPress={this.handleBackClick}
                          containerStyle={styles.backBtn} size={25}/>
                    <View style={styles.btnDivider}/>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{this.props.title}</Text>
                        {Utils.isEmpty(this.props.rightSecondBtn) ? null : this.props.rightSecondBtn}
                        {Utils.isEmpty(this.props.rightIcon) ? null :
                            <Icon name={this.props.rightIcon} type={'material-community'}
                                  onPress={() => this.handleRightClick()} containerStyle={styles.backBtn} size={25}/>
                        }
                        {Utils.isEmpty(this.props.rightBtnText) ? null : (
                            <TouchableOpacity style={{marginRight: 5}} activeOpacity={0.6}
                                              onPress={() => this.props.handleRightBtnClick()}>
                                <View style={{
                                    // backgroundColor: '#49BC1C',
                                    backgroundColor: GlobalStyles.btnColor,
                                    height: 35,
                                    width: width / 8,
                                    borderRadius: 3,
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        color: "#ffffff",
                                        fontSize: 16,
                                        // marginBottom: 5
                                    }}>{this.props.rightBtnText}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    }

    render() {
        if (Platform.OS === "ios") {
            return this.renderIOS();
        }
        return this.renderAndroid();
    }

    handleRightClick() {
        if (!Utils.isEmpty(this.props.handleRightClick)) {
            this.props.handleRightClick();
        }
    }

    handleBackClick = () => {
        this.props.nav.goBack();
        if (this.props.callback != null) {
            this.props.callback();
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column"
    },
    content: {
        width: width,
        height: 50,
        backgroundColor: Global.titleBackgroundColor,
        flexDirection: "row",
        alignItems: "center",
    },
    backBtn: {
        marginLeft: 8,
        marginRight: 8,
        // width: 30,
        // height: 30
    },
    btnDivider: {
        width: 1 / PixelRatio.get(),
        height: 30,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "#888888"
    },
    titleContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10
    },
    title: {
        color: "#393A3E",
        fontSize: 16,
        flex: 1
    },
    img: {
        width: 30,
        height: 30,
        marginRight: 5
    }
});
