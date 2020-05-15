import MainTab from './TabNavigator'
import pagesEditWdYhq from './editWd/yhq';
import pagesLoginRegister from './login/register'
import pagesLoginIndex from './login/index';
import pagesGrdtFb from './grdt/fb';
import pagesGrdtIndex from './grdt/index';
import pagesEditWdIndex from './editWd/index';
import pagesPlIndex from './pl/index';
import pagesPlContent from './pl/plContent';
import pagesDetailIndex from './detail/index';
import pagesWdIndex from './wd/index';
import pagesXxIndex from './xx/index';
import pagesDz from './xx/dz';
import pagesXd from './xx/xd';
import pagesGcDetail from './gc/detail';
import pagesGcIndex from './gc/index';
import pagesThlIndex from './thl/index';
import pagesMultiSelect from './editWd/multiSelect';
import pagesMatchMaker from './detail/matchMaker';
import pagesPrice from './views/Price';
import pagesCoin from './views/Coin';
import pagesActivitiesAD from './thl/activitiesAD';
import pagesMessage from './message/Message';
import pagesChatting from './message/Chatting';
import pagesBlackList from './xx/blackList';
import pagesGroupInfo from './message/GroupInfo';
import pagesResetPassword from './login/resetPassword';
import pagePayPal from './views/PayPalView';
import pageWebView from './views/WebView';
import pageMatchMakerView from './xx/MatchMakerView';
import pageMatchMakerLogView from './xx/MatchMakerLogView';
import pagePublishPartyView from './thl/PublishPartyView';
import pagePartyListView from './thl/PartyListView';
import pagePartyCheckingView from './thl/PartyCheckingView';
import pageMyPartyView from './thl/MyPartyView';
/*

    --- 路由配置 ---

   * 所有组件都必须在这里注册
   * 在这里设置的navigationOptions的权限 > 对应页面里面的 static navigationOptions的设置 > StackNavigator()第二个参数里navigationOptions的设置
   * 该配置文件会在App.js里的StackNavigator(导航组件)里使用。

*/
const RouteConfig = {
    MyPartyView: {
        screen: pageMyPartyView,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    PartyCheckingView: {
        screen: pagePartyCheckingView,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    PartyListView: {
        screen: pagePartyListView,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    PublishPartyView: {
        screen: pagePublishPartyView,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    MatchMakerLogView: {
        screen: pageMatchMakerLogView,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    MatchMakerView: {
        screen: pageMatchMakerView,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    WebView: {
        screen: pageWebView,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    PayPal: {
        screen: pagePayPal,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    MainTab: {
        screen: MainTab,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    LoginIndex: {
        screen: pagesLoginIndex,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    EditWdIndex: {
        screen: pagesEditWdIndex,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    DetailIndex: {
        screen: pagesDetailIndex,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    ActivitiesAD: {
        screen: pagesActivitiesAD,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    Price: {
        screen: pagesPrice,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    Chatting: {
        screen: pagesChatting,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    EditWdYhq: {
        screen: pagesEditWdYhq,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    LoginRegister:
        {
            screen: pagesLoginRegister,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    GrdtFb: {
        screen: pagesGrdtFb,
        navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
    },
    GrdtIndex:
        {
            screen: pagesGrdtIndex,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    PlIndex:
        {
            screen: pagesPlIndex,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    PlContent:
        {
            screen: pagesPlContent,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    WdIndex:
        {
            screen: pagesWdIndex,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    XxIndex:
        {
            screen: pagesXxIndex,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    Dz:
        {
            screen: pagesDz,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    Xd:
        {
            screen: pagesXd,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    GcDetail:
        {
            screen: pagesGcDetail,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    GcIndex:
        {
            screen: pagesGcIndex,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    MultiSelect:
        {
            screen: pagesMultiSelect,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    MatchMaker:
        {
            screen: pagesMatchMaker,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    Coin:
        {
            screen: pagesCoin,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    Message:
        {
            screen: pagesMessage,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    BlackList:
        {
            screen: pagesBlackList,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    GroupInfo:
        {
            screen: pagesGroupInfo,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        },
    ResetPassword:
        {
            screen: pagesResetPassword,
            navigationOptions: ({navigation}) => ({headerShown: false, gesturesEnable: true})
        }
};

export default RouteConfig;
