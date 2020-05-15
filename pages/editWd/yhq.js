import React, {Component} from 'react';
import {ScrollView, Image, View,SafeAreaView} from "react-native";
import {ListItem, Button} from 'react-native-elements';
import CommonTitleBar from '../views/CommonTitleBar';
import {Provider} from '@ant-design/react-native';
import api from '../service/allMembersApi';
import config from '../service/config';
import {withNavigationFocus} from 'react-navigation';
import LoadingView from "../views/LoadingView";

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            coin: 0,
            baseInfo: config.state === '1' ? '已完成' : '去完善',
            allInfo: '去完善',
            publish: '去发布',
            loginTime: '登录1天',
            favorite: '',
            allInfoStatus: true,
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.isFocused) {
            this.setState({visible: true});
            this._componentDidMount();
        }
    }

    _componentDidMount() {
        const that = this;
        api.getCoin().then(function (message) {
            that.setState({
                publish: message.social_messages > 0 ? '已完成' : '去发布',
                favorite: message.favorites > 0 ? '已完成' : '',
                coin: message.coin > 0 ? message.coin : 0,
                allInfoStatus: message.allInfoStatus,
                visible: false
            });
        }, function (error) {

        }).done();
    }

    edit = () => {
        if (this.state.allInfoStatus === false) {
            this.props.navigation.navigate('EditWdIndex');
        }
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={{flex: 1}}>
                        <CommonTitleBar
                            title={"我的心动币"}
                            nav={this.props.navigation}
                        />
                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}
                        <ScrollView>
                            <ListItem title="心动币" subtitle={this.state.coin + '枚'}
                                      rightElement={<Button
                                          title="购买金币"
                                          type="clear"
                                          onPress={() =>
                                              this.props.navigation.navigate('Coin')
                                          }
                                      />}
                            />
                            <ListItem
                                style={{marginTop: 10}}
                                // leftIcon={<Icon
                                //   name='account-badge-alert-outline'
                                //   type='material-community'
                                //   color='#EE6A50'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image source={require("../images/name.png")}
                                                    style={{width: 20, height: 20}}/>}
                                title={'完善基础资料'}
                                subtitle={'心动币 +10个'}
                                bottomDivider={true}
                                chevron={true}
                                rightTitle={this.state.baseInfo}
                                onPress={() => {
                                    if (this.state.baseInfo === '去完善') this.props.navigation.navigate('EditWdIndex')
                                }}
                            />
                            <ListItem
                                style={{marginTop: 10}}
                                // leftIcon={<Icon
                                //   name='account-badge-alert-outline'
                                //   type='material-community'
                                //   color='#EE6A50'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image source={require("../images/completed-task.png")}
                                                    style={{width: 20, height: 20}}/>}
                                title={'完善全部资料'}
                                subtitle={'心动币 +10个'}
                                bottomDivider={true}
                                chevron={true}
                                rightTitle={this.state.allInfoStatus === false ? '去完善' : '已完成'}
                                onPress={this.edit}
                            />
                            <ListItem
                                // leftIcon={<Icon
                                //   name='account-heart-outline'
                                //   type='material-community'
                                //   color='#EE6A50'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image source={require("../images/star.png")}
                                                    style={{width: 20, height: 20}}/>}
                                title={'首次关注用户'}
                                subtitle={'心动币 +1个'}
                                bottomDivider={true}
                                chevron={true}
                                rightTitle={this.state.favorite}
                                // onPress={this.grdt}
                            />
                            {/* <ListItem
        leftIcon={<Icon
          name='account-badge-horizontal-outline'
          type='material-community'
          color='#EE6A50'
          size={20}
          iconStyle={image}
        />}
        title={'完成身份认证'}
        subtitle={'心动币 首次认证 +5个'}
        bottomDivider={true}
        chevron={true}
        rightTitle={'去认证'}
      // onPress={this.grdt}
      /> */}
                            {/* <ListItem
        leftIcon={<Icon
          name='share-variant'
          type='material-community'
          color='#EE6A50'
          size={20}
          iconStyle={image}
        />}
        title={'分享给好友'}
        subtitle={'心动币 +1~5个'}
        bottomDivider={true}
        chevron={true}
        rightTitle={'去分享'}
      // onPress={this.grdt}
      />
      <ListItem
        leftIcon={<Icon
          name='headset'
          type='material-community'
          color='#EE6A50'
          size={20}
          iconStyle={image}
        />}
        title={'添加客服'}
        subtitle={'心动币 +1个'}
        bottomDivider={true}
        chevron={true}
        rightTitle={'去添加'}
      // onPress={this.grdt}
      /> */}
                            <ListItem
                                // leftIcon={<Icon
                                //   name='cellphone-text'
                                //   type='material-community'
                                //   color='#EE6A50'
                                //   size={20}
                                //   iconStyle={image}
                                // />}
                                leftElement={<Image source={require("../images/ins.png")}
                                                    style={{width: 20, height: 20}}/>}
                                title={'首次发布个人动态'}
                                subtitle={'心动币 +1个'}
                                bottomDivider={true}
                                chevron={true}
                                rightTitle={this.state.publish}
                                onPress={() => {
                                    if (this.state.publish === '去发布') this.props.navigation.navigate('GrdtIndex', {id: 0});
                                }}
                            />
                            {/* <ListItem
            // leftIcon={<Icon
            //   name='calendar-range'
            //   type='material-community'
            //   color='#EE6A50'
            //   size={20}
            //   iconStyle={image}
            // />}
            leftElement={<Image source={require("../images/enter.png")} style={{ width: 20, height: 20 }} />}
            title={'每天登陆一次'}
            subtitle={'心动币 每天+1个'}
            bottomDivider={true}
            chevron={true}
            rightTitle={'登录1天'}
          // onPress={this.grdt}
          /> */}
                        </ScrollView>
                    </View>
                </Provider>
            </SafeAreaView>
        );
    }
}

export default withNavigationFocus(Index);
