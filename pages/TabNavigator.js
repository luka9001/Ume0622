import React, {PureComponent} from 'react';
import {
    Image,
    StyleSheet, View,
} from 'react-native';
import {Badge} from 'react-native-elements';
// import { TabNavigator } from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';

import imageMessageNormal from './images/message_normal.png';
import imageMessageSelected from './images/message_selected.png';
import imageHeartsNormal from './images/hearts_normal.png';
import imageHeartsSelected from './images/hearts_selected.png';
import imageNoticeNormal from './images/notice_normal.png';
import imageNoticeSelected from './images/notice_selected.png';
import imageUserNormal from './images/user_normal.png';
import imageUserSelected from './images/user_selected.png';
import imageEarthNormal from './images/worldwide_normal.png';
import imageEarthSelected from './images/worldwide_selected.png';

import pagesWdIndex from './wd/index';
import pagesXxIndex from './xx/index';
import pagesGcIndex from './gc/index';
import pagesThlIndex from './thl/index';
import pagesMessage from './message/Message';
// import {Icon} from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Global from './util/Global';

const MainTab = createMaterialBottomTabNavigator({
    Home: {
        screen: pagesThlIndex,
        navigationOptions: ({navigation, screeProps}) => ({
            //这里设置StackNavigator属性和一般情况下Tabbar不同页面可能会不同的属性

            //设置StackNavigator属性
            // header:null,
            // headerTitle: 'U&ME',
            // headerStyle: styles.navigator,
            // headerTitleStyle: styles.navigatorTitle,
            // gesturesEnabled:true,

            //这里设置Tabbar不同页面可能会不同的属性
            // tabBarColor: '#6518F4',
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: 'U&ME',
            tabBarIcon: (({tintColor, focused}) => {
                return (

                    focused ? <MaterialCommunityIcons name="heart-multiple" color={'pink'} size={25}/> :
                        <MaterialCommunityIcons name={'heart-multiple-outline'}
                                                color={'gray'}
                                                size={25}/>
                    // <Image
                    //     source={focused ? imageHeartsNormal : imageHeartsSelected}
                    //     style={styles.tabbarImage}
                    // />
                );
            }),
        }),
    },
    Gc: {
        screen: pagesGcIndex,
        navigationOptions: ({navigation, screeProps}) => ({
            // tabBarColor: '#1F65FF',
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: '动 态',
            tabBarIcon: (({tintColor, focused}) => {
                return (
                    focused ? <MaterialCommunityIcons name={'camera-iris'}
                                                      color={'pink'} size={25}/> :
                        <MaterialCommunityIcons name={'camera-iris'}
                                                color={'gray'}
                                                size={25}/>
                );
            }),
        }),
    },
    Message: {
        screen: pagesMessage,
        navigationOptions: ({navigation, screeProps}) => ({
            // tabBarColor: '#FF69B4',
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: '消 息',
            tabBarIcon: (({tintColor, focused}) => {
                return (
                    focused ? <MaterialCommunityIcons name={'chat'}
                                    size={25}
                                    color={'pink'}/> :
                        <MaterialCommunityIcons name={'chat'}
                              size={25}
                              color={'gray'}/>
                    // focused ? <View><Icon name={'chat'}
                    //                       type={'material-community'}
                    //                       color={'pink'}
                    //                       containerStyle={styles.tabbarImage}/>{Global.JMessageCount ? <Badge
                    //         status="success"
                    //         containerStyle={{position: 'absolute', top: -4, right: -4}}
                    //     /> : null}</View> :
                    //     <View><Icon name={'chat'}
                    //                 type={'material-community'}
                    //                 color={'gray'}
                    //                 containerStyle={styles.tabbarImage}/>{Global.JMessageCount ? <Badge
                    //         status="success"
                    //         containerStyle={{position: 'absolute', top: -4, right: -4}}
                    //     /> : null}</View>
                );
            }),
        }),
    },
    Xx: {
        screen: pagesXxIndex,
        navigationOptions: ({navigation, screeProps}) => ({
            // tabBarColor: '#006D6A',
            tabBarColor: '#ffffff',
            tabBarVisible: true,
            tabBarLabel: '发 现',
            tabBarIcon: (({tintColor, focused}) => {
                return (
                    focused ? <MaterialCommunityIcons name={'compass'} size={25}
                                          color={'pink'}/>:
                        <MaterialCommunityIcons name={'compass-outline'} size={25}
                                    color={'gray'}/>
                    // focused ? <View><Icon name={'compass'} type={'material-community'}
                    //                       color={'pink'}
                    //                       containerStyle={styles.tabbarImage}/><Badge
                    //         status="success"
                    //         containerStyle={{position: 'absolute', top: -4, right: -4}}
                    //     /></View> :
                    //     <View><Icon name={'compass-outline'} type={'material-community'}
                    //                 color={'gray'}
                    //                 containerStyle={styles.tabbarImage}/><Badge
                    //         status="success"
                    //         containerStyle={{position: 'absolute', top: -4, right: -4}}
                    //     /></View>
                    // <Image
                    //     source={focused ? imageNoticeNormal : imageNoticeSelected}
                    //     style={styles.tabbarImage}
                    // />
                )
            }),
        }),
    },
    User:
        {
            screen: pagesWdIndex,
            navigationOptions: ({navigation, screeProps}) => ({
                // tabBarColor: '#D02760',
                tabBarColor: '#ffffff',
                tabBarVisible: true,
                tabBarLabel: '我',
                tabBarIcon: (({tintColor, focused}) => {
                    return (
                        focused ? <MaterialCommunityIcons name={'account'} size={25}
                                        color={'pink'}/> :
                            <MaterialCommunityIcons name={'account-outline'} size={25}
                                  color={'gray'}/>
                        // <Image
                        //     source={focused ? imageUserNormal : imageUserSelected}
                        //     style={styles.tabbarImage}
                        // />
                    )
                }),
            }),
        },
}, {
    //这里设置的是一般情况下Tabbar共同的属性
    tabBarPosition: 'bottom', // 设置tabbar的位置，iOS默认在底部，安卓默认在顶部。（属性值：'top'，'bottom')
    swipeEnabled: false, // 是否允许在标签之间进行滑动。
    animationEnabled: false, // 是否在更改标签时显示动画。
    lazy: true, // 是否根据需要懒惰呈现标签，而不是提前制作，意思是在app打开的时候将底部标签栏全部加载，默认false,推荐改成true哦。
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
export default MainTab;

const styles = StyleSheet.create({
    navigatorTitle: {
        fontSize: 17,
        color: 'white',
    },
    navigator: {
        backgroundColor: '#d81e06',
    },
    tabbarImage: {
        // width: 25,
        // height: 25,
        // marginBottom: -3,
    },
});
