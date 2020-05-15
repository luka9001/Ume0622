import React from "react";
import {Modal, StyleSheet, Text, View, Dimensions, Image, TouchableOpacity} from 'react-native';
import Global from "../util/Global";

const {width} = Dimensions.get('window');
export default class SuccessView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <Modal transparent={true} onRequestClose={() => this.props.cancel()}>
                <View style={styles.loading}>
                    <View
                        style={{
                            width: width - 80,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white'
                        }}
                    >
                        <Image source={require('../images/ok.png')} style={{width: 100, height: 100, margin: 20}}/>
                        <Text style={{fontSize: 20, color: 'gray', marginBottom: 10}}>{this.props.text}</Text>
                        <View style={{height: 1, width: width - 80, backgroundColor: Global.pageBackgroundColor}}/>
                        <TouchableOpacity
                            style={{alignItems: 'center', justifyContent: 'center', margin: 10, width: width - 80}}
                            onPress={() => {
                                this.props.ok()
                            }}>
                            <Text style={{fontSize: 20}}>知道了</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }
});