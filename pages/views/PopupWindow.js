import React from "react";
import Global from "../util/Global";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ListItem, Icon } from "react-native-elements";

const { width, height } = Dimensions.get("window");
let mwidth = 180;
let mheight = 220;
const bgColor = Global.titleBackgroundColor;
const top = 50;
let dataArray;
const image = {
  width: 20,
  height: 20,
  marginLeft: 10,
  marginRight: 10,
};

export default class MenuModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: this.props.show
    };
    mwidth = this.props.width;
    mheight = this.props.height;
    dataArray = this.props.dataArray;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ isVisible: nextProps.show });
  }

  closeModal() {
    this.setState({
      isVisible: false
    });
    this.props.closeModal(false);
  }

  render() {
    let menuItems = [];
    let icons = this.props.menuIcons;
    let texts = this.props.menuTexts;
    let colors = this.props.menuIconsColor;
    // for (var i = 0; i < icons.length; i++) {
    //   menuItems.push(
    //     <TouchableOpacity
    //       key={i}
    //       activeOpacity={0.3}
    //       onPress={this.handlePopMenuItemClick.bind(this, i)}
    //       style={styles.itemView}
    //     >
    //       <Image style={styles.imgStyle} source={icons[i]} />
    //       <Text style={styles.textStyle}>{texts[i]}</Text>
    //     </TouchableOpacity>
    //   );
    // }

    for (let i = 0; i < icons.length; i++) {
      menuItems.push(
        <ListItem
          leftIcon={<Icon
            name={icons[i]}
            type='material-community'
            color={colors[i]}
            size={20}
            iconStyle={image}
          />}
          title={texts[i]}
          titleStyle={styles.textStyle}
          onPress={this.handlePopMenuItemClick.bind(this, i)}
          style={styles.listItem}
          containerStyle={{ backgroundColor: bgColor }}
        />);
    }
    return (
      <View style={styles.container}>
        <Modal
          transparent={true}
          visible={this.state.isVisible}
          animationType={"fade"}
          onRequestClose={() => this.closeModal()}
        >
          <TouchableOpacity
            style={styles.container}
            onPress={() => this.closeModal()}
          >
            <View style={styles.modal}>{menuItems}</View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  handlePopMenuItemClick = index => {
    this.props.filter(index);
    // if (index === 1) {
    //   // 添加朋友
    //   this.props.nav.navigate("AddFriends");
    // } else if (index === 0) {
    //   // 发起群聊
    //   this.props.nav.navigate("CreateGroup");
    // }
    this.closeModal();
  };
}
const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
  },
  modal: {
    backgroundColor: bgColor,
    width: mwidth,
    height: mheight,
    position: "absolute",
    left: width - mwidth - 10,
    top: top,
    padding: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  itemView: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    width: mwidth,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 8
  },
  listItem: {
    width: mwidth,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  textStyle: {
    // color: "#fff",
    color:'#393A3E',
    fontSize: 16,
    marginLeft: 5
  },
  imgStyle: {
    // width: 32,
    // height: 32,
    width: 20,
    height: 20,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5
  }
});
