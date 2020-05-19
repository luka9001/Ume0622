import React, {Component} from "react";
import MenuPopWindow from "../views/PopupWindow";
import Global from "../util/Global";
import config from "../service/config";
import Toast from '@ant-design/react-native';
import {withNavigationFocus} from 'react-navigation';

import {
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Button,
    PixelRatio,
    Platform
} from "react-native";
import StorageUtil from "../util/StorageUtil";
import AntmModal from "@ant-design/react-native/lib/modal/Modal";
import {Icon} from "react-native-elements";

const {width, height} = Dimensions.get("window");

const X_WIDTH = 375;
const X_HEIGHT = 812;

class TitleBar extends Component {
    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.isFocused) {
            const that = this;
            StorageUtil.get('check_status', function (error, object) {
                if (object !== null) {
                    that.setState({
                        checkStatus: object
                    });
                }
            });
            return true;
        } else {
            return false;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            showPop: false,
            searchImage: this.props.isfilter !== false ? require("../images/ic_search.png") : null,
            checkStatus: 0
        };
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
            <View style={styles.titleBarContainer}>
                <View style={styles.titleBarTextContainer}>
                    <Text style={styles.title}>{this.props.title}</Text>
                </View>
                <View style={styles.titleBarButtonContainer}>
                    {this.props.isfilter ?
                        <Icon name={'magnify'} type={'material-community'} onPress={this.handleSearchClick} size={30}/>
                        : null}
                    {this.props.isCamera ?
                        <Icon name={'camera'} type={'material-community'} onPress={this.handleAddClick} size={30}/> : null}

                    <View
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: width,
                            height: height
                        }}
                    >
                        <MenuPopWindow
                            width={140}
                            height={200}
                            show={this.state.showPop}
                            closeModal={show => {
                                this.setState({showPop: show});
                            }}
                            nav={this.props.nav}
                            filter={index => {
                                this.props.filter(index);
                                this.setSearchImage(index);
                            }}
                            menuIcons={[
                                'human-male-female',
                                'human-female',
                                'human-male'
                                // require("../images/ic_pop_group_chat.png"),
                                // require("../../images/ic_pop_add_friends.png"),
                                // require("../../images/ic_pop_scan.png"),
                                // require("../../images/ic_pop_pay.png"),
                                // require("../../images/ic_pop_help.png")
                            ]}
                            menuIconsColor={[
                                '#EE6A50',
                                '#FF69B4',
                                '#63B8FF'
                            ]}
                            menuTexts={[
                                '全部',
                                '只看女生',
                                '只看男生',

                                // "发起群聊",
                                // "添加朋友",
                                // "扫一扫",
                                // "收付款",
                                // "帮助与反馈"
                            ]}
                        />
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
            // <View style={{flexDirection: "column"}}>
            //     <View
            //         style={{height: h, backgroundColor: Global.titleBackgroundColor}}
            //     />
                <View style={styles.titleBarContainer}>
                    <View style={styles.titleBarTextContainer}>
                        <Text style={styles.title}>{this.props.title}</Text>
                    </View>
                    <View style={styles.titleBarButtonContainer}>
                        {this.props.isfilter ?
                            <Icon name={'magnify'} type={'material-community'} onPress={this.handleSearchClick}
                                  containerStyle={styles.titleBarImg} size={30}/> : null}

                        {this.props.isCamera ?
                            <Icon name={'camera'} type={'material-community'} onPress={this.handleAddClick} size={30}/> : null}
                        <View
                            style={{
                                position: "absolute",
                                top: 100,
                                left: 0,
                                width: width,
                                height: height
                            }}
                        >
                            <MenuPopWindow
                                width={140}
                                height={200}
                                show={this.state.showPop}
                                closeModal={show => {
                                    this.setState({showPop: show});
                                }}
                                nav={this.props.nav}
                                filter={index => {
                                    this.props.filter(index);
                                    this.setSearchImage(index);
                                }}
                                menuIcons={[
                                    'human-male-female',
                                    'human-female',
                                    'human-male'
                                    // require('../images/ic_camera.png')
                                    // require("../images/ic_pop_group_chat.png"),
                                    // require("../../images/ic_pop_add_friends.png"),
                                    // require("../../images/ic_pop_scan.png"),
                                    // require("../../images/ic_pop_pay.png"),
                                    // require("../../images/ic_pop_help.png")
                                ]}
                                menuIconsColor={[
                                    '#EE6A50',
                                    'pink',
                                    '#63B8FF'
                                ]}
                                menuTexts={[
                                    '全部',
                                    '只看女生',
                                    '只看男生',
                                    // "发起群聊",
                                    // "添加朋友",
                                    // "扫一扫",
                                    // "收付款",
                                    // "帮助与反馈"
                                ]}
                            />
                        </View>
                    </View>
                </View>
            // </View>
        );
    }

    render() {
        if (Platform.OS === "ios") {
            return this.renderIOS();
        }
        return this.renderAndroid();
    }

    handleSearchClick = () => {
        // 跳转到SearchScreen界面
        // this.props.nav.navigate("Search");
        this.setState({showPop: !this.state.showPop});
    };

    handleAddClick = () => {
        // 打开右上角菜单
        // this.setState({ showPop: !this.state.showPop });
        this.fb();
    };

    fb = () => {
        if (config.access_token === 'none') {
            this.props.nav.navigate('LoginIndex');
        } else if (config.state !== '1') {
            Toast.info('请先完善您的资料！', 1, undefined, false);
            this.props.nav.navigate('EditWdIndex');
        } else if (this.state.checkStatus === 0) {
            AntmModal.alert('提醒', '您的资料将在24小时内审核完毕', [{text: '知道了'}])
        } else if (this.state.checkStatus === 2) {
            AntmModal.alert('提醒', '很遗憾，您的资料未通过审核', [{text: '取消'}, {
                text: '前往修改', onPress: () => this.props.navigation.navigate('EditWdIndex')
            }])
        } else {
            this.props.nav.navigate('GrdtFb', {callback: this.props.callback});
        }
    };

    setSearchImage(index) {
        switch (index) {
            case 0:
                this.state.searchImage = require("../images/ic_search.png");
                break;
            case 1:
                this.state.searchImage = require("../images/female.png");
                break;
            case 2:
                this.state.searchImage = require("../images/male.png");
                break;
            default:
                break;
        }
    }
}

class CustomModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false
        };
    }

    render() {
        return (
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                    alert("Modal has been closed.");
                }}
            >
                <View style={modalStyle.container}>
                    <View style={modalStyle.content}>
                        <Text>Hello World! This is a Modal!</Text>
                        <Button
                            style={{marginTop: 20}}
                            title={"Close"}
                            onPress={() => {
                                this.setState({modalVisible: false});
                            }}
                        />
                    </View>
                </View>
            </Modal>
        );
    }

    closeModel = () => {
        this.setState({modalVisible: false});
    };

    openModal() {
        this.setState({modalVisible: true});
    }
}

export default withNavigationFocus(TitleBar);

const modalStyle = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    content: {
        width: width - 40,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: "#FFFFFF",
        height: 100,
        borderRadius: 5,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10
    }
});

const styles = StyleSheet.create({
    titleBarContainer: {
        flexDirection: "row",
        width: width,
        height: 50,
        backgroundColor: Global.titleBackgroundColor
    },
    titleBarTextContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10
    },
    titleBarButtonContainer: {
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 10,
        paddingRight: 10
    },
    title: {
        // color: "#FFFFFF",
        color: "#393A3E",
        fontSize: 18,
        fontWeight: "bold"
    },
    titleBarImg: {
        // width: 25,
        // height: 25,
        marginLeft: 15,
        marginRight: 15
    }
});
