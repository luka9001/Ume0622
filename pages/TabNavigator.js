import React from 'react';
import {
    View
} from 'react-native';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';

import pagesWdIndex from './wd/index';
import pagesXxIndex from './xx/index';
import pagesGcIndex from './gc/index';
import pagesThlIndex from './thl/index';
import pagesMessage from './message/Message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {BadgeItem} from './views/BadgeItem';
import store from './store/index';
import { connect } from 'react-redux';
import { change,setMsgUnreadCount } from './actions/actionCreators';

const MainTab = createMaterialBottomTabNavigator({
    Home: {
        screen: pagesThlIndex,
        navigationOptions: ({navigation, screeProps}) => ({
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: '缘 局',
            tabBarIcon: (({tintColor, focused}) => {
                return (

                    focused ? <MaterialCommunityIcons name="heart-multiple" color={'pink'} size={20}/> :
                        <MaterialCommunityIcons name={'heart-multiple-outline'}
                                                color={'gray'}
                                                size={20}/>
                );
            }),
        }),
    },
    Gc: {
        screen: pagesGcIndex,
        navigationOptions: ({navigation, screeProps}) => ({
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: '动 态',
            tabBarIcon: (({tintColor, focused}) => {
                return (
                    focused ? <MaterialCommunityIcons name={'camera-iris'}
                                                            color={'pink'} size={20}/> :
                        <MaterialCommunityIcons name={'camera-iris'}
                                                color={'gray'}
                                                      size={20}/>
                );
            }),
        }),
    },
    Message: {
        screen: pagesMessage,
        navigationOptions: ({navigation, screeProps}) => ({
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: '消 息',
            tabBarIcon: (({tintColor, focused}) => {
                return (
                    focused ? <View><MaterialCommunityIcons name={'chat'}
                                    size={20}
                                    color={'pink'}/>{BadgeItem(store.getState().msg_unread_count)}</View> :
                    <View><MaterialCommunityIcons name={'chat'}
                                      size={20}
                                      color={'gray'}/>{BadgeItem(store.getState().msg_unread_count)}</View>
                );
            }),
        }),
    },
    Xx: {
        screen: pagesXxIndex,
        navigationOptions: ({navigation, screeProps}) => ({
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: '发 现',
            tabBarIcon: (({tintColor, focused}) => {
                return (
                    focused ? <MaterialCommunityIcons name={'compass'} size={20}
                                          color={'pink'}/>:
                        <MaterialCommunityIcons name={'compass-outline'} size={20}
                                    color={'gray'}/>
                )
            }),
        }),
    },
    User:
        {
            screen: pagesWdIndex,
            navigationOptions: ({navigation, screeProps}) => ({
                tabBarColor: '#ffffff',
                tabBarVisible: true,
                tabBarLabel: '我',
                tabBarIcon: (({tintColor, focused}) => {
                    return (
                        focused ? <MaterialCommunityIcons name={'account'} size={20}
                                        color={'pink'}/> :
                            <MaterialCommunityIcons name={'account-outline'} size={20}
                                  color={'gray'}/>
                    )
                }),
            }),
        },
}, {
    //这里设置的是一般情况下Tabbar共同的属性
    tabBarPosition: 'bottom', // 设置tabbar的位置，iOS默认在底部，安卓默认在顶部。（属性值：'top'，'bottom')
    swipeEnabled: false, // 是否允许在标签之间进行滑动。
    animationEnabled: false, // 是否在更改标签时显示动画。
    lazy: false, // 是否根据需要懒惰呈现标签，而不是提前制作，意思是在app打开的时候将底部标签栏全部加载，默认false,推荐改成true哦。
    initialRouteName: '', // 设置默认的页面组件
    backBehavior: 'none', // 按 back 键是否跳转到第一个Tab(首页)， none 为不跳转
    tabBarOptions: {
        activeTintColor: '#d81e06', // label和icon的前景色 活跃状态下（选中）。
        inactiveTintColor: '#515151', // label和icon的前景色 不活跃状态下(未选中)。
        barStyle: {backgroundColor: '#694fad'},
        labelStyle: {
            fontSize: 12,
        }, //label的样式。
    },
    // 缩放图标的效果
    shifting: false, // 默认在大于3个路由时为true, 如果显式的设置为true了则少于3个时也会显示效果
    activeColor: '#393A3E',
    inactiveColor: 'gray',
    barStyle: {backgroundColor: '#ffffff'},
});
const mapState = state => ({
    data: state.data,
    msg_unread_count:state.msg_unread_count
});

const mapDispatch = dispatch => ({
    changeData() {
        dispatch(change())
    },
    setMsgUnreadCount(count){
        dispatch(setMsgUnreadCount(count))
    }
});
export default connect(mapState,mapDispatch)(MainTab);
