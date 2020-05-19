import React, {Component} from 'react';
import {
    Platform,
    View,
    ScrollView,
    Image,
    StyleSheet,
    Clipboard,
    Linking,
    Alert,
    SafeAreaView
} from "react-native";
import {ListItem, Button, PricingCard} from 'react-native-elements';
import {Modal, Toast, Provider} from '@ant-design/react-native';
import serverConfig from '../service/config';
import CommonTitleBar from '../views/CommonTitleBar';
import api from '../service/price';
import StorageUtil from "../util/StorageUtil";
import {withNavigationFocus} from 'react-navigation';
import priceApi from "../service/price";
import Global from "../util/Global";

import RNIap, {
    InAppPurchase,
    PurchaseError,
    SubscriptionPurchase,
    acknowledgePurchaseAndroid,
    consumePurchaseAndroid,
    finishTransaction,
    finishTransactionIOS,
    purchaseErrorListener,
    purchaseUpdatedListener,
} from 'react-native-iap';
import LoadingView from "./LoadingView";

const itemSubs = Platform.select({
    ios: [
        'orz.qianyuan.vipo3',
        'orz.qianyuan.vipo4',
        'orz.qianyuan.vipo5'
    ],
    android: [
        'orz.qianyuan.vipo3',
        'orz.qianyuan.vipo4',
        'orz.qianyuan.vipo5'
    ],
});

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

const url = serverConfig.host;

/**
 * detail 商品名称
 * price 原价
 * price_d 打折价格
 * service_detail 商品服务内容
 */
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            product: 0,
            price: 0,
            product_type: -1,
            payViewStatus: false,
            payInfoViewStatus: false,
            detail0: '',
            price0: 0,
            isSubscription0: false,
            price_d0: 0,
            service_detail0: '',
            detail1: '',
            price1: 0,
            isSubscription1: false,
            price_d1: 0,
            service_detail1: '',
            detail2: '',
            price2: 0,
            isSubscription2: false,
            price_d2: 0,
            service_detail2: '',
            vip_level: 0,
            vip_start_time: 0,
            products: [],//可用的订购
            purchases: []//已经订阅的内容
        };
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.isFocused) {
            this.setState({
                visible: true,
                payViewStatus: false
            });
            this.getVipDiscount();
            // this.getProductsFromApple();
        }
    }

    getVipDiscount() {
        let that = this;
        api.getVipDiscount().then(function (params) {
            let disCount = params.data.coinDiscount;
            let payInfo = params.data.payInfo;
            let vip_start_time = params.data.vip_start_time;
            let vip_level = params.data.vip_level;

            StorageUtil.set('vip_level', vip_level > 0 ? vip_level : 0);
            StorageUtil.set('vip_start_time', vip_start_time != null ? vip_start_time : 0);

            that.setState({disCount, vip_level, vip_start_time});
            payInfo.forEach(element => {
                switch (element.type) {
                    case 3: {
                        that.setState({
                            detail0: element.detail,
                            service_detail0: element.service_detail,
                        });
                        if (Platform.OS === 'android' && Global.IsHuawei) {
                            that.setState({
                                price0: element.price,
                            });
                        }
                        break;
                    }

                    case 4: {
                        that.setState({
                            detail1: element.detail,
                            service_detail1: element.service_detail,
                        });
                        if (Platform.OS === 'android' && Global.IsHuawei) {
                            that.setState({
                                price1: element.price,
                            });
                        }
                        break;
                    }

                    case 5: {
                        that.setState({
                            detail2: element.detail,
                            service_detail2: element.service_detail,
                        });
                        if (Platform.OS === 'android' && Global.IsHuawei) {
                            that.setState({
                                price2: element.price,
                            });
                        }
                        break;
                    }

                    default:
                        break;
                }
            });
            if (disCount > 0) {
                let p = disCount / 10;
                that.setState({
                    price_d0: (that.state.price0 * p).toFixed(2),
                    price_d1: (that.state.price1 * p).toFixed(2),
                    price_d2: (that.state.price2 * p).toFixed(2)
                })
            }
            if (Platform.OS === 'ios') {
                RNIap.clearProductsIOS();
                that.getProductsFromApple().then(r => {
                    that.setState({visible: false})
                });
            } else {
                if (Global.IsHuawei) {
                    that.setState({visible: false})
                } else {
                    RNIap.consumeAllItemsAndroid().then(r => {
                    });
                    that.getProductsFromApple().then(r => {
                        that.setState({visible: false})
                    });
                }

            }
        }, function (error) {
            that.setState({visible: false});
            Alert.alert('网络错误', '请检查后再试');
        }).done();
    }

    async getProductsFromApple() {
        try {
            const products: Product[] = await RNIap.getProducts(itemSubs);
            console.log('Available purchases :: ', products.length);
            this.setState({products, visible: false});
            products.forEach(element => {
                switch (element.productId) {
                    case itemSubs[0]:
                        this.setState({
                            price0: element.localizedPrice
                        });
                        break;
                    case itemSubs[1]:
                        this.setState({
                            price1: element.localizedPrice
                        });
                        break;
                    case itemSubs[2]:
                        this.setState({
                            price2: element.localizedPrice
                        });
                        break;

                    default:
                        break;
                }
            });
            // this.getAvailablePurchases();
        } catch (error) {
            this.getProductsFromApple();
        }
    }

    _pay(product, price, product_type) {
        if (Global.IsHuawei) {
            this.setState({
                product,
                price,
                product_type,
                payViewStatus: true
            });
        } else {
            // if (Platform.OS === 'ios') {
            this.setState({
                visible: true
            });
            console.log('Available purchases :: ', itemSubs[product_type - 3]);
            // this.requestSubscription(itemSubs[product_type - 3]);
            this.requestPurchase(itemSubs[product_type - 3]);
            // } else {
            //     this.setState({
            //         product,
            //         price,
            //         product_type,
            //         payViewStatus: true
            //     });
            // }
        }
    }

    requestPurchase = async (sku): void => {
        try {
            this.setState({
                visible: true
            });
            await RNIap.requestPurchase(sku, false);
        } catch (err) {
            console.warn('Available purchases :: ', err.code + err.message);
        }
    };

    vipLevelView(vip_level) {
        switch (vip_level) {
            case 0:
                return null;
            case 1:
                return '月度';
            case 2:
                return '半年';
            case 3:
                return '年度';
            default:
                break;
        }
    }

    async componentDidMount() {
        try {
            const result = await RNIap.initConnection();
            if (!result) {
                Alert.alert('支付功能无法使用', '请检查是否绑定银行卡');
            }
            // const pendingPurchases = await RNIap.getPendingPurchasesIOS();
            // console.log('Available purchases', pendingPurchases.length);
        } catch (err) {
            console.warn(err); // standardized err.code and err.message available
        }

        purchaseUpdateSubscription = purchaseUpdatedListener(
            async (purchase: InAppPurchase | SubscriptionPurchase) => {
                // console.log('Available purchases', purchase.productId);
                const receipt = purchase.transactionReceipt;
                if (receipt) {
                    let that = this;
                    const product_type = purchase.productId.split('orz.qianyuan.vipo')[1];
                    try {
                        // finishTransaction(purchase);
                        if (Platform.OS === 'ios') {
                            // const receiptBody = {
                            //   'receipt-data': receipt,
                            //   'password': '982a5652ed8c4fa4b3098f817761e7c6'
                            // };
                            // const result = await RNIap.validateReceiptIos(receiptBody, true);
                            // console.log('Available purchases', result.status + '=' + result.receipt);
                            console.log('Available purchases', purchase.productId);
                            console.log('Available purchases', JSON.stringify({
                                'product': purchase.productId,
                                'price': this.state.products[product_type - 3].price,//转换为对应的index
                                'product_type': product_type,
                                'transactionDate': purchase.transactionDate
                            }));
                            priceApi.postPayPalResult(JSON.stringify({
                                'product': purchase.productId,
                                'price': this.state.products[product_type - 3].price,
                                'product_type': product_type
                            })).then(function (data) {
                                that.setState({
                                    visible: false
                                });
                                finishTransactionIOS(purchase.transactionId);
                            }, function (error) {
                                that.setState({
                                    visible: false
                                });
                                Alert.alert('购买时发生错误', '请再次尝试');
                            }).done();

                        } else if (Platform.OS === 'android') {
                            console.log('Available purchases', purchase.purchaseToken);
                            console.log('Available purchases', JSON.stringify({
                                'product': purchase.purchaseToken,
                                'price': this.state.products[product_type - 3].price,//转换为对应的index
                                'product_type': product_type,
                                'transactionDate': purchase.transactionDate
                            }));
                            priceApi.postPayPalResult(JSON.stringify({
                                'product': purchase.purchaseToken,
                                'price': this.state.products[product_type - 3].price,
                                'product_type': product_type
                            })).then(function (data) {
                                that.setState({
                                    visible: false
                                });
                                // If consumable (can be purchased again) 消耗品
                                consumePurchaseAndroid(purchase.purchaseToken);

                                // If not consumable 非消耗品
                                // acknowledgePurchaseAndroid(purchase.purchaseToken);
                            }, function (error) {
                                that.setState({
                                    visible: false
                                });
                                Alert.alert('购买时发生错误', '请再次尝试');
                            }).done();
                        }
                    } catch (ackErr) {
                        // console.warn('Available purchases', ackErr);
                        console.log('Available purchases', 'ackErr:' + ackErr);
                    }
                }
            },
        );

        purchaseErrorSubscription = purchaseErrorListener(
            (error: PurchaseError) => {
                console.log('purchaseErrorListener', error);
                // Alert.alert('purchase error', JSON.stringify(error));
                Alert.alert('确认购买错误', JSON.stringify(error).message);
            },
        );
    }

    componentWillUnmount(): void {
        if (purchaseUpdateSubscription) {
            purchaseUpdateSubscription.remove();
            purchaseUpdateSubscription = null;
        }
        if (purchaseErrorSubscription) {
            purchaseErrorSubscription.remove();
            purchaseErrorSubscription = null;
        }
    }

    getItems = async (): void => {
        try {
            const products = await RNIap.getProducts(itemSkus);
            // const products = await RNIap.getSubscriptions(itemSkus);
            console.log('Products', products);
            this.setState({productList: products});
        } catch (err) {
            console.warn(err.code, err.message);
        }
    };

    getSubscriptions = async (): void => {
        try {
            const products = await RNIap.getSubscriptions(itemSubs);
            products.forEach(element => {
                console.log('Products', element.productId);
            });
            this.setState({productList: products});
        } catch (err) {
            // console.warn(err.code, err.message);
        }
    };

    getAvailablePurchases = async (): void => {
        try {
            // console.info(
            //   'Get available purchases (non-consumable or unconsumed consumable)',
            // );
            const purchases = await RNIap.getAvailablePurchases();

            console.log('Available purchases', purchases.length);
            // purchases.forEach(element => {
            //   console.info('Available purchases :: ', element.productId);
            // });
            if (purchases && purchases.length > 0) {
                // this.setState({
                //   availableItemsMessage: `Got ${purchases.length} items.`,
                //   receipt: purchases[0].transactionReceipt,
                // });
                this.setState({
                    purchases,
                    visible: false
                });
                // purchases.map((purchase, i) => {
                //   if (purchase.productId === productId) {
                //     this.setState({ isSubscription0: true });
                //     break;
                //   }
                // });
            }
        } catch (err) {
            console.warn(err.code, err.message);
            // Alert.alert(err.message + '，请退出该页面再次进入');
            this.getAvailablePurchases();
        }
    };

    requestSubscription = async (sku): void => {
        try {
            // this.setState({
            //   visible: true
            // });
            await RNIap.requestSubscription(sku);
        } catch (err) {
            // Alert.alert(err.message);
        }
    };

    _isSubscription(productId) {
        for (let index = 0; index < this.state.purchases.length; index++) {
            const purchase = this.state.purchases[index];
            if (purchase.productId === productId) {
                // console.log('Available purchases', purchase.productId + '=' + productId);
                return true;
            }
        }
    }

    render() {
        // if (Platform.OS === 'ios') {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <Provider>
                    <View style={styles.container}>
                        {this.state.visible ? (
                            <LoadingView
                                cancel={() => this.setState({visible: false})}
                            />
                        ) : null}
                        <CommonTitleBar
                            title={"会员"}
                            nav={this.props.navigation}
                        />
                        {this.state.vip_level === 0 ? null :
                            <ListItem title={'vip:' + this.vipLevelView(this.state.vip_level)}
                                      subtitle={'开始时间:' + this.state.vip_start_time}/>}
                        {this.state.visible === false ? <ScrollView>
                            <PricingCard
                                color="#4f9deb"
                                title={this.state.detail0}
                                price={this.state.price0}
                                button={{title: '成为月度会员'}}
                                // onButtonPress={() => this._isSubscription(itemSubs[0]) ? null : this._pay('月度', this.state.price0, 3)}
                                onButtonPress={() => this._pay('月度', this.state.price0, 3)}
                            />

                            <PricingCard
                                color="pink"
                                title={this.state.detail1}
                                price={this.state.price1}
                                button={{title: '成为季度会员'}}
                                onButtonPress={() => this._pay('半年', this.state.price1, 4)}
                            />
                            <PricingCard
                                color="purple"
                                title={this.state.detail2}
                                price={this.state.price2}
                                // button={{ title: this._isSubscription(itemSubs[2]) ? '已订阅' : '成为年度会员' }}
                                button={{title: '成为年度会员'}}
                                onButtonPress={() => this._pay('年度', this.state.price2, 5)}
                            />
                            {/* <View style={{ padding: 10 }}>
                <Text>自动续期服务申明</Text>
                <Text style={styles.detailFontColor}>·付款：确认购买，即从苹果iTunes账户扣款</Text>
                <Text style={styles.detailFontColor}>·续期：服务到期前24小时，苹果自动从iTunes账户中扣费，成功后服务有效期自动延续一个周期；</Text>
                <Text style={styles.detailFontColor}>·取消续期：如果取消自动续期，请在iTunes账户扣费至少24小时之前，前往你的iOS设备的设置-iTunes/Apple ID设置中找到相关的订阅记录，关闭订阅。</Text>
              </View> */}
                        </ScrollView> : null}
                    </View>
                    <Modal
                        popup
                        onClose={() => this.setState({payViewStatus: false})}
                        maskClosable={true}
                        visible={this.state.payViewStatus}
                        animationType="slide-up"
                    >
                        <ListItem title={this.state.product} subtitle={'会员'}/>
                        <ListItem title={"€" + this.state.price} subtitle={'金额'} bottomDivider={true}/>
                        {/* <ListItem
                          leftElement={<Image style={{ width: 20, height: 20 }} source={require("../images/point-of-service.png")} />}
                          title={'汇款'}
                          bottomDivider={true}
                          onPress={() => {
                            this.setState({
                              payInfoViewStatus: true,
                              payViewStatus: false
                            })
                          }}
                        /> */}
                        <ListItem
                            // leftIcon={<Icon
                            //   name='logout-variant'
                            //   type='material-community'
                            //   color='#63B8FF'
                            //   size={20}
                            //   iconStyle={image}
                            // />}
                            leftElement={<Image style={{width: 20, height: 20}}
                                                source={require("../images/credit-card.png")}/>}
                            title={'在线支付'}
                            // subtitle={'目前不能使用,正在对接中'}
                            onPress={() => {
                                this.props.navigation.navigate('PayPal', {
                                    product: this.state.product,
                                    price: this.state.price,
                                    product_type: this.state.product_type
                                });
                            }}
                            bottomDivider={true}
                        />

                        <ListItem
                            // leftIcon={<Icon
                            //   name='close-circle'
                            //   type='material-community'
                            //   color='gray'
                            //   size={20}
                            //   iconStyle={image}
                            // />}
                            leftElement={<Image style={{width: 20, height: 20}}
                                                source={require("../images/error.png")}/>}
                            title={'取消'}
                            bottomDivider={true}
                            onPress={() => {
                                this.setState({
                                    payViewStatus: false
                                })
                            }}
                        />
                    </Modal>
                </Provider>
            </SafeAreaView>
        );
        // }
        // return (
        //     <Provider>
        //         <View style={styles.container}>
        //             {this.state.visible ? (
        //                 <LoadingView
        //                     cancel={() => this.setState({visible: false})}
        //                 />
        //             ) : null}
        //             <CommonTitleBar
        //                 title={"会员"}
        //                 nav={this.props.navigation}
        //             />
        //             {this.state.vip_level === 0 ?
        //                 null
        //                 : <ListItem title={'vip:' + this.vipLevelView(this.state.vip_level)}
        //                             subtitle={'开始时间:' + this.state.vip_start_time}/>}
        //             <ScrollView>
        //                 <PricingCard
        //                     color="#4f9deb"
        //                     title={this.state.detail0}
        //                     price={this.state.price0}
        //                     info={[this.state.service_detail0, this.state.price_d0 === 0 ? null : '打折', this.state.price_d0 === 0 ? null : '€' + this.state.price_d0]}
        //                     button={{title: '成为月度会员'}}
        //                     onButtonPress={() => this._pay('月度', this.state.price_d0 === 0 ? this.state.price0 : this.state.price_d0, 3)}
        //                 />
        //                 <PricingCard
        //                     color="pink"
        //                     title={this.state.detail1}
        //                     price={this.state.price1}
        //                     // info={['打折', '', '€' + this.state.price_d1]}
        //                     info={[this.state.service_detail1, this.state.price_d1 === 0 ? null : '打折', this.state.price_d1 === 0 ? null : '€' + this.state.price_d1]}
        //                     button={{title: '成为季度会员'}}
        //                     onButtonPress={() => this._pay('半年', this.state.price_d1 === 0 ? this.state.price1 : this.state.price_d1, 4)}
        //                 />
        //                 <PricingCard
        //                     color="purple"
        //                     title={this.state.detail2}
        //                     price={this.state.price2}
        //                     // info={['打折', '', '€' + this.state.price_d2]}
        //                     info={[this.state.service_detail2, this.state.price_d2 === 0 ? null : '打折', this.state.price_d2 === 0 ? null : '€' + this.state.price_d2]}
        //                     button={{title: '成为年度会员'}}
        //                     onButtonPress={() => this._pay('年度', this.state.price_d2 === 0 ? this.state.price2 : this.state.price_d2, 5)}
        //                 />
        //             </ScrollView>
        //             <Modal
        //                 popup
        //                 onClose={() => this.setState({payViewStatus: false})}
        //                 maskClosable={true}
        //                 visible={this.state.payViewStatus}
        //                 animationType="slide-up"
        //             >
        //                 <ListItem title={this.state.product} subtitle={'会员'}/>
        //                 <ListItem title={"€" + this.state.price} subtitle={'金额'} bottomDivider={true}/>
        //                 {/* <ListItem
        //       leftElement={<Image style={{ width: 20, height: 20 }} source={require("../images/point-of-service.png")} />}
        //       title={'汇款'}
        //       bottomDivider={true}
        //       onPress={() => {
        //         this.setState({
        //           payInfoViewStatus: true,
        //           payViewStatus: false
        //         })
        //       }}
        //     /> */}
        //                 <ListItem
        //                     // leftIcon={<Icon
        //                     //   name='logout-variant'
        //                     //   type='material-community'
        //                     //   color='#63B8FF'
        //                     //   size={20}
        //                     //   iconStyle={image}
        //                     // />}
        //                     leftElement={<Image style={{width: 20, height: 20}}
        //                                         source={require("../images/credit-card.png")}/>}
        //                     title={'在线支付'}
        //                     // subtitle={'目前不能使用,正在对接中'}
        //                     onPress={() => {
        //                         this.props.navigation.navigate('PayPal', {
        //                             product: this.state.product,
        //                             price: this.state.price,
        //                             product_type: this.state.product_type
        //                         });
        //                     }}
        //                     bottomDivider={true}
        //                 />
        //
        //                 <ListItem
        //                     // leftIcon={<Icon
        //                     //   name='close-circle'
        //                     //   type='material-community'
        //                     //   color='gray'
        //                     //   size={20}
        //                     //   iconStyle={image}
        //                     // />}
        //                     leftElement={<Image style={{width: 20, height: 20}}
        //                                         source={require("../images/error.png")}/>}
        //                     title={'取消'}
        //                     bottomDivider={true}
        //                     onPress={() => {
        //                         this.setState({
        //                             payViewStatus: false
        //                         })
        //                     }}
        //                 />
        //             </Modal>
        //             <Modal
        //                 transparent
        //                 onClose={() => this.setState({
        //                     payInfoViewStatus: false
        //                 })}
        //                 maskClosable={true}
        //                 visible={this.state.payInfoViewStatus}
        //             >
        //                 <ScrollView>
        //                     <ListItem title={'€' + this.state.price} subtitle={'汇款金额(点击复制)'} onPress={() => {
        //                         Clipboard.setString(this.state.price);
        //                         Toast.info('汇款金额已复制')
        //                     }}/>
        //                     <ListItem title={'ES80 2038 1062 1830 0494 9053'} subtitle={'Bankia(点击复制)'} onPress={() => {
        //                         Clipboard.setString('ES8020381062183004949053');
        //                         Toast.info('银行账号已复制')
        //                     }}/>
        //                     <ListItem title={'ES49 0182 4055 5602 0333 7152'} subtitle={'BBVA(点击复制)'}
        //                               bottomDivider={true} onPress={() => {
        //                         Clipboard.setString('ES4901824055560203337152');
        //                         Toast.info('银行账号已复制')
        //                     }}/>
        //                     <ListItem title={'Yi Li'} subtitle={'受益人(点击复制)'} bottomDivider={true} onPress={() => {
        //                         Clipboard.setString('Yi Li');
        //                         Toast.info('受益人信息已复制')
        //                     }}/>
        //                     <ListItem title={'qianyuanespana'} subtitle={'微信客服(点击复制)'} bottomDivider={true}
        //                               onPress={() => {
        //                                   Clipboard.setString('qianyuanespana');
        //                                   Toast.info('微信号已复制')
        //                               }}/>
        //                     <ListItem title={'+34631510689'} subtitle={'电话(点击拨打)'} bottomDivider={true} onPress={() => {
        //                         let tel = 'tel:+34631510689'// 目标电话
        //                         Alert.alert('提示', '即将呼叫办事处',
        //                             [{
        //                                 text: '取消', onPress: () => {
        //                                 }
        //                             },
        //                                 {
        //                                     text: '确定',
        //                                     onPress: () => {
        //                                         Linking.canOpenURL(tel).then((supported) => {
        //                                             if (!supported) {
        //                                                 console.log('Can not handle tel:' + tel)
        //                                             } else {
        //                                                 return Linking.openURL(tel)
        //                                             }
        //                                         }).catch(error => console.log('tel error', error))
        //                                     }
        //                                 }])
        //                     }}/>
        //                     <ListItem title={'calle de mercedes Arteaga,13 madrid.'} subtitle={'地址(点击复制)'}
        //                               bottomDivider={true} onPress={() => {
        //                         Clipboard.setString('calle de mercedes Arteaga,13 madrid.');
        //                         Toast.info('地址信息已复制')
        //                     }}/>
        //                     <ListItem title={'汇款时备注'} subtitle={'手机号码和套餐(月度、半年或年度)'} bottomDivider={true}/>
        //                     <Button
        //                         title="关闭"
        //                         containerStyle={{marginTop: 10}}
        //                         loading={this.state.payLoadingStatus}
        //                         onPress={() => {
        //                             this.setState({
        //                                 payInfoViewStatus: false
        //                             });
        //                         }}
        //                     />
        //                 </ScrollView>
        //             </Modal>
        //         </View>
        //     </Provider>
        // );
    }
}

const styles = StyleSheet.create({
    contentFindView: {
        flex: 1,
        position: "absolute",
        bottom: 5,
        right: "50%",
        marginRight: -58,
    },
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#F8F8F8"
    },
    detailFontColor: {
        color: 'gray'
    }
});
export default withNavigationFocus(Index);
