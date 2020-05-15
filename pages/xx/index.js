import React, {Component} from 'react';
import {View, SafeAreaView, FlatList, Image, Text, Dimensions} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';
import {Toast, Provider} from '@ant-design/react-native';
import config from '../service/config';
import TitleBar from '../views/TitleBar';
import imageHeartsNormal from '../images/hearts_normal.png';
import {withNavigationFocus} from 'react-navigation';
import UserInfoApi from "../service/UserInfoApi";
import Global from "../util/Global";
import Utils from "../util/Utils";

const {width} = Dimensions.get('window');
const image = {
    width: 20,
    height: 20,
    marginLeft: 10,
    marginRight: 10,
};

const list = [
    {
        name: '所有评论',
        leftIcon: <Icon
            name='comment-processing-outline'
            type='material-community'
            color='#43CD80'
            size={20}
            iconStyle={image}
        />,
        bottomDivider:true,
        leftElement: <Image style={{width: 20, height: 20}} source={require("../images/send.png")}/>,
        url: 'PlContent'
    },
    {
        name: '所有点赞',
        leftIcon: <Icon
            name='thumb-up-outline'
            type='material-community'
            color='pink'
            size={20}
            iconStyle={image}
        />,
        bottomDivider:true,
        leftElement: <Image style={{width: 20, height: 20}} source={require("../images/like.png")}/>,
        url: 'Dz'
    },
    {
        name: '我的关注',
        leftIcon: <Icon
            name='heart-outline'
            type='material-community'
            color='#EE6A50'
            size={20}
            iconStyle={image}
        />,
        bottomDivider:false,
        leftElement: <Image style={{width: 20, height: 20}} source={require("../images/star.png")}/>,
        url: 'Xd'
    },
    {},
    {
        name: '我的黑名单',
        leftIcon: <Icon
            name='thumb-up-outline'
            type='material-community'
            color='pink'
            size={20}
            iconStyle={image}
        />,
        bottomDivider:false,
        leftElement: <Image style={{width: 20, height: 20}} source={require("../images/lock.png")}/>,
        url: 'BlackList'
    },
    {},
    {
        name: '求助红娘',
        leftElement: <Image style={{width: 20, height: 20}} source={imageHeartsNormal}/>,
        bottomDivider:false,
        url: 'MatchMakerView'
    }
];

class Index extends Component {
    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        UserInfoApi.getUserInfo();
        return true;
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({item}) => (
        Utils.isEmpty(item.name) ? <View style={{backgroundColor: Global.pageBackgroundColor, height: 10}}/> :
            <ListItem
                title={item.name}
                leftElement={item.leftElement}
                // leftIcon={item.leftIcon}
                onPress={() => {
                    if (config.access_token === 'none') {
                        this.props.navigation.navigate('LoginIndex');
                    } else if (config.state !== '1') {
                        Toast.info('请先完善您的资料！', 1, undefined, false);
                        this.props.navigation.navigate('EditWdIndex');
                    } else {
                        this.props.navigation.navigate(item.url);
                    }
                }}
                bottomDivider={item.bottomDivider}
            />
    );

    _onPressItem = (_url) => {
        this.props.navigation.navigate(_url);
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <View style={{flex: 1, backgroundColor: Global.pageBackgroundColor}}>
                    <TitleBar title={'发现'} nav={this.props.navigation} isfilter={false}/>
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        data={list}
                        renderItem={this.renderItem}
                    />
                </View>
            </SafeAreaView>
        )
    }
}

export default withNavigationFocus(Index);
