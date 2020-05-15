import React, {Component} from 'react';
import {
    Platform,
    View,
    ScrollView,
    StyleSheet,
    Image,
    Clipboard,
    Linking,
    Alert
} from "react-native";
import {Icon, ListItem, Button, PricingCard} from 'react-native-elements';
import {Modal, Toast, Provider} from '@ant-design/react-native';
import serverConfig from '../service/config';
import CommonTitleBar from './CommonTitleBar';
import api from '../service/price';
import {withNavigationFocus} from 'react-navigation';
import priceApi from "../service/price";
import Global from "../util/Global"

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
import SafeAreaView from "react-native-safe-area-view";

const url = serverConfig.host;

// App Bundle > com.dooboolab.test

const itemSkus = Platform.select({
    ios: [
        'orz.qianyuan.coin0',
        'orz.qianyuan.coin1',
        'orz.qianyuan.coin2'
    ],
    android: [
        'orz.qianyuan.coin0',
        'orz.qianyuan.coin1',
        'orz.qianyuan.coin2'
    ],
});

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

/**
 * detail 商品名称
 * price 原价
 * price_d 打折价格
 * service_detail 商品服务内容
 */
class Index extends Component {
    purchaseUpdateSubscription = null;
    purchaseErrorSubscription = null;

    constructor(props) {
        super(props);
        this.state = {
            coin: 0,
            price: 0,
            payViewStatus: false,
            payInfoViewStatus: false,
            disCount: 0,
            visible: true,
            detail0: '',
            price0: 0,
            price_d0: 0,
            service_detail0: '',
            detail1: '',
            price1: 0,
            price_d1: 0,
            service_detail1: '',
            detail2: '',
            price2: 0,
            price_d2: 0,
            service_detail2: '',
            product_type: -1,
            products: []
        };

        this.getCoinDiscount();
        // this.getProductsFromApple();
    }

    getCoinDiscount() {
        let that = this;
        api.getCoinDiscount().then(function (params) {
            let disCount = params.data.coinDiscount;
            let payInfo = params.data.payInfo;
            that.setState({disCount});
            payInfo.forEach(element => {
                switch (element.type) {
                    case 0: {
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
                    case 1: {
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
                    case 2: {
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
                if (!Global.IsHuawei) {
                    RNIap.consumeAllItemsAndroid().then(r => {
                    });
                    that.getProductsFromApple().then(r => {
                        that.setState({visible: false})
                    });
                } else {
                    that.setState({visible: false})
                }
            }
        }, function (error) {
            that.setState({visible: false});
            Alert.alert('网络错误', '请检查后再试');
        }).done();
    }

    async getProductsFromApple() {
        try {
            const products: Product[] = await RNIap.getProducts(itemSkus);
            this.setState({products, visible: false});

            products.forEach(element => {
                switch (element.productId) {
                    case itemSkus[0]:
                        this.setState({
                            price0: element.localizedPrice
                        });
                        break;
                    case itemSkus[1]:
                        this.setState({
                            price1: element.localizedPrice
                        });
                        break;
                    case itemSkus[2]:
                        this.setState({
                            price2: element.localizedPrice
                        });
                        break;

                    default:
                        break;
                }
            });
        } catch (error) {
            this.getProductsFromApple();
        }
    }

    _pay(coin, price, product_type) {
        this.setState({
            coin,
            price,
            product_type
        });
        if (Platform.OS === 'ios') {
            // console.log('Available purchases :: ', itemSkus[product_type]);
            this.requestPurchase(itemSkus[product_type]);
        } else {
            // console.log('Available purchases :: ', itemSkus[product_type]);
            if (Global.IsHuawei) {
                this.setState({
                    payViewStatus: true
                });
            } else {
                this.requestPurchase(itemSkus[product_type]);
            }
        }
    }

    async componentDidMount() {
        try {
            const result = await RNIap.initConnection();
            if (!result) {
                Alert.alert('支付功能无法使用', '请检查是否绑定银行卡');
            }
        } catch (err) {
            console.warn(err); // standardized err.code and err.message available
        }

        purchaseUpdateSubscription = purchaseUpdatedListener(
            async (purchase: InAppPurchase | SubscriptionPurchase) => {
                const receipt = purchase.transactionReceipt;
                console.log(receipt);
                if (receipt) {
                    try {
                        if (Platform.OS === 'ios') {
                            const receiptBody = {
                                'receipt-data': receipt
                            };
                            // const result = await RNIap.validateReceiptIos(receiptBody, true);
                            // console.log('Available purchases', result.status + '=' + result.receipt);

                            let that = this;
                            const product_type = purchase.productId.split('orz.qianyuan.coin')[1];
                            priceApi.postPayPalResult(JSON.stringify({
                                'product': purchase.productId,
                                'price': this.state.products[product_type].price,
                                'product_type': product_type
                            })).then(function (data) {
                                // Alert.alert('购买确认', '确认');
                                that.setState({
                                    visible: false
                                });
                                finishTransactionIOS(purchase.transactionId);
                            }, function (error) {
                                that.setState({
                                    visible: false
                                });
                                Modal.alert('购买时发生错误', '请重新进入该页面，系统将自动为您解决', [{text: '知道了'}]);
                            }).done();

                        } else if (Platform.OS === 'android') {
                            const receiptBody = {
                                'receipt-data': receipt
                            };

                            let that = this;
                            const product_type = purchase.productId.split('orz.qianyuan.coin')[1];
                            console.log('支付' + product_type);
                            priceApi.postPayPalResult(JSON.stringify({
                                'product': purchase.purchaseToken,
                                'price': this.state.products[product_type].price,
                                'product_type': product_type
                            })).then(function (data) {
                                // Alert.alert('购买确认', '确认');
                                that.setState({
                                    visible: false
                                });
                                // If consumable (can be purchased again)
                                consumePurchaseAndroid(purchase.purchaseToken);
                                // If not consumable
                                // acknowledgePurchaseAndroid(purchase.purchaseToken);

                                // const ackResult = finishTransaction(purchase);
                            }, function (error) {
                                that.setState({
                                    visible: false
                                });
                                Modal.alert('购买时发生错误', '请重新进入该页面，系统将自动为您解决', [{text: '知道了'}]);
                            }).done();
                        }
                        // const ackResult = await finishTransaction(purchase);
                    } catch (ackErr) {
                        console.warn('ackErr', ackErr);
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

    componentWillUnmount() {
        if (this.purchaseUpdateSubscription) {
            this.purchaseUpdateSubscription.remove();
            this.purchaseUpdateSubscription = null;
        }
        if (this.purchaseErrorSubscription) {
            this.purchaseErrorSubscription.remove();
            this.purchaseErrorSubscription = null;
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
            console.log('Products', products);
            this.setState({productList: products});
        } catch (err) {
            console.warn(err.code, err.message);
        }
    };

    getAvailablePurchases = async (): void => {
        try {
            console.info(
                'Get available purchases (non-consumable or unconsumed consumable)',
            );
            const purchases = await RNIap.getAvailablePurchases();
            console.info('Available purchases :: ', purchases);
            if (purchases && purchases.length > 0) {
                this.setState({
                    availableItemsMessage: `Got ${purchases.length} items.`,
                    receipt: purchases[0].transactionReceipt,
                });
            }
        } catch (err) {
            console.warn(err.code, err.message);
            Alert.alert(err.message);
        }
    };

    // Version 3 apis
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
                            title={"购买心动币"}
                            nav={this.props.navigation}
                        />
                        <ScrollView>
                            <PricingCard
                                color="#4f9deb"
                                title={this.state.detail0}
                                price={this.state.price0}

                                // info={[this.state.service_detail0, this.state.price_d0 === 0 ? null : '打折', this.state.price_d0 === 0 ? null : '€' + this.state.price_d0]}
                                button={{title: '购买'}}
                                onButtonPress={() => this._pay('200枚', this.state.price_d0 === 0 ? this.state.price0 : this.state.price_d0, 0)}
                            />
                            <PricingCard
                                color="pink"
                                title={this.state.detail1}
                                price={this.state.price1}

                                // info={[this.state.service_detail1, this.state.price_d1 === 0 ? null : '打折', this.state.price_d1 === 0 ? null : '€' + this.state.price_d1]}
                                button={{title: '购买'}}
                                onButtonPress={() => this._pay('500枚', this.state.price_d1 === 0 ? this.state.price1 : this.state.price_d1, 1)}
                            />
                            <PricingCard
                                color="purple"
                                title={this.state.detail2}
                                price={this.state.price2}

                                // info={[this.state.service_detail2, this.state.price_d2 === 0 ? null : '打折', this.state.price_d2 === 0 ? null : '€' + this.state.price_d2]}
                                button={{title: '购买'}}
                                onButtonPress={() => this._pay('1000枚', this.state.price_d2 === 0 ? this.state.price2 : this.state.price_d2, 2)}
                            />
                        </ScrollView>
                    </View>
                    <Modal
                        popup
                        onClose={() => this.setState({payViewStatus: false})}
                        maskClosable={true}
                        visible={this.state.payViewStatus}
                        animationType="slide-up"
                    >
                        <ListItem title={this.state.coin} subtitle={'心动币'}/>
                        <ListItem title={'€' + this.state.price} subtitle={'金额'} bottomDivider={true}/>
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
                                    product: this.state.coin,
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
        // } else {
        //     return (
        //         <Provider>
        //             <View style={styles.container}>
        //                 {this.state.visible ? (
        //                     <LoadingView
        //                         cancel={() => this.setState({visible: false})}
        //                     />
        //                 ) : null}
        //                 <CommonTitleBar
        //                     title={"购买心动币"}
        //                     nav={this.props.navigation}
        //                 />
        //                 <ScrollView>
        //                     <PricingCard
        //                         color="#4f9deb"
        //                         title={this.state.detail0}
        //                         price={"€" + this.state.price0}
        //                         // info={['打折', '', '€' + this.state.price_d0]}
        //                         info={[this.state.service_detail0, this.state.price_d0 === 0 ? null : '打折', this.state.price_d0 === 0 ? null : '€' + this.state.price_d0]}
        //                         button={{title: '购买'}}
        //                         onButtonPress={() => this._pay('200枚', this.state.price_d0 === 0 ? this.state.price0 : this.state.price_d0, 0)}
        //                     />
        //                     <PricingCard
        //                         color="pink"
        //                         title={this.state.detail1}
        //                         price={"€" + this.state.price1}
        //                         // info={['打折', '', '€' + this.state.price_d1]}
        //                         info={[this.state.service_detail1, this.state.price_d1 === 0 ? null : '打折', this.state.price_d1 === 0 ? null : '€' + this.state.price_d1]}
        //                         button={{title: '购买'}}
        //                         onButtonPress={() => this._pay('500枚', this.state.price_d1 === 0 ? this.state.price1 : this.state.price_d1, 1)}
        //                     />
        //                     <PricingCard
        //                         color="purple"
        //                         title={this.state.detail2}
        //                         price={"€" + this.state.price2}
        //                         // info={['打折', '', '€' + this.state.price_d2]}
        //                         info={[this.state.service_detail2, this.state.price_d2 === 0 ? null : '打折', this.state.price_d2 === 0 ? null : '€' + this.state.price_d2]}
        //                         button={{title: '购买'}}
        //                         onButtonPress={() => this._pay('1000枚', this.state.price_d2 === 0 ? this.state.price2 : this.state.price_d2, 2)}
        //                     />
        //                 </ScrollView>
        //                 <Modal
        //                     popup
        //                     onClose={() => this.setState({payViewStatus: false})}
        //                     maskClosable={true}
        //                     visible={this.state.payViewStatus}
        //                     animationType="slide-up"
        //                 >
        //                     <ListItem title={this.state.coin} subtitle={'心动币'}/>
        //                     <ListItem title={'€' + this.state.price} subtitle={'金额'} bottomDivider={true}/>
        //                     {/* <ListItem
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
        //                     <ListItem
        //                         // leftIcon={<Icon
        //                         //   name='logout-variant'
        //                         //   type='material-community'
        //                         //   color='#63B8FF'
        //                         //   size={20}
        //                         //   iconStyle={image}
        //                         // />}
        //                         leftElement={<Image style={{width: 20, height: 20}}
        //                                             source={require("../images/credit-card.png")}/>}
        //                         title={'在线支付'}
        //                         // subtitle={'目前不能使用,正在对接中'}
        //                         onPress={() => {
        //                             this.props.navigation.navigate('PayPal', {
        //                                 product: this.state.coin,
        //                                 price: this.state.price,
        //                                 product_type: this.state.product_type
        //                             });
        //                         }}
        //                         bottomDivider={true}
        //                     />
        //
        //                     <ListItem
        //                         // leftIcon={<Icon
        //                         //   name='close-circle'
        //                         //   type='material-community'
        //                         //   color='gray'
        //                         //   size={20}
        //                         //   iconStyle={image}
        //                         // />}
        //                         leftElement={<Image style={{width: 20, height: 20}}
        //                                             source={require("../images/error.png")}/>}
        //                         title={'取消'}
        //                         bottomDivider={true}
        //                         onPress={() => {
        //                             this.setState({
        //                                 payViewStatus: false
        //                             })
        //                         }}
        //                     />
        //                 </Modal>
        //                 <Modal
        //                     transparent
        //                     onClose={() => {
        //                         this.setState({
        //                             payInfoViewStatus: false
        //                         })
        //                     }}
        //                     maskClosable={true}
        //                     visible={this.state.payInfoViewStatus}
        //                 >
        //                     <ScrollView>
        //                         <ListItem title={'€' + this.state.price} subtitle={'汇款金额(点击复制)'} onPress={() => {
        //                             Clipboard.setString(this.state.price);
        //                             Toast.info('汇款金额已复制')
        //                         }}/>
        //                         <ListItem title={'ES80 2038 1062 1830 0494 9053'} subtitle={'Bankia(点击复制)'}
        //                                   onPress={() => {
        //                                       Clipboard.setString('ES8020381062183004949053');
        //                                       Toast.info('银行账号已复制')
        //                                   }}/>
        //                         <ListItem title={'ES49 0182 4055 5602 0333 7152'} subtitle={'BBVA(点击复制)'}
        //                                   bottomDivider={true} onPress={() => {
        //                             Clipboard.setString('ES4901824055560203337152');
        //                             Toast.info('银行账号已复制')
        //                         }}/>
        //                         <ListItem title={'Yi Li'} subtitle={'受益人(点击复制)'} bottomDivider={true} onPress={() => {
        //                             Clipboard.setString('Yi Li');
        //                             Toast.info('受益人信息已复制')
        //                         }}/>
        //                         <ListItem title={'qianyuanespana'} subtitle={'微信客服(点击复制)'} bottomDivider={true}
        //                                   onPress={() => {
        //                                       Clipboard.setString('qianyuanespana');
        //                                       Toast.info('微信号已复制')
        //                                   }}/>
        //                         <ListItem title={'+34631510689'} subtitle={'电话(点击拨打)'} bottomDivider={true}
        //                                   onPress={() => {
        //                                       let tel = 'tel:+34631510689'// 目标电话
        //                                       Alert.alert('提示', '即将呼叫办事处',
        //                                           [{
        //                                               text: '取消', onPress: () => {
        //                                               }
        //                                           },
        //                                               {
        //                                                   text: '确定',
        //                                                   onPress: () => {
        //                                                       Linking.canOpenURL(tel).then((supported) => {
        //                                                           if (!supported) {
        //                                                               console.log('Can not handle tel:' + tel)
        //                                                           } else {
        //                                                               return Linking.openURL(tel)
        //                                                           }
        //                                                       }).catch(error => console.log('tel error', error))
        //                                                   }
        //                                               }])
        //                                   }}/>
        //                         <ListItem title={'calle de mercedes Arteaga,13 madrid.'} subtitle={'地址(点击复制)'}
        //                                   bottomDivider={true} onPress={() => {
        //                             Clipboard.setString('calle de mercedes Arteaga,13 madrid.');
        //                             Toast.info('地址信息已复制')
        //                         }}/>
        //                         <ListItem title={'汇款时备注'} subtitle={'手机号码和套餐(200、500或1000)'} bottomDivider={true}/>
        //                         <Button
        //                             title="关闭"
        //                             containerStyle={{marginTop: 10}}
        //                             loading={this.state.payLoadingStatus}
        //                             onPress={() => {
        //                                 this.setState({
        //                                     payInfoViewStatus: false
        //                                 });
        //                             }}
        //                         />
        //                     </ScrollView>
        //                 </Modal>
        //             </View>
        //         </Provider>
        //     );
        // }
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
})
export default withNavigationFocus(Index);
