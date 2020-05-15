import {Image} from "react-native";
import React, {Component} from "react";

export default class VipLevelView extends Component
{
    render(){
        switch (this.props.vipLevel) {
            case 1:
                return (
                    <Image style={this.props.style}
                           source={require("../images/vip1.png")}/>
                );
            case 2:
                return (
                    <Image style={this.props.style}
                           source={require("../images/vip2.png")}/>
                );
            case 3:
                return (
                    <Image style={this.props.style}
                           source={require("../images/vip3.png")}/>
                );
            default :
                return null
        }
    }
}