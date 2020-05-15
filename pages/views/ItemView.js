import {StyleSheet, Text, TouchableOpacity, View, Dimensions, ScrollView, Platform} from "react-native";
import React from "react";
import Utils from '../util/Utils';
import {KeyboardTrackingView} from "react-native-keyboard-tracking-view";

const {width} = Dimensions.get('window');

export const SelectItem = (props: any) => (
    <TouchableOpacity onPress={props.onPress}>
        <View style={styles.pwdView}>
            <View style={styles.pwdContainer}>
                <View style={{flex: 1}}>{props.children}</View>
                <View style={{flex: 9}}>
                    <Text style={styles.textInput}>{props.text}</Text>
                </View>
            </View>
            <View style={{height: 10}}/>
            <View style={styles.pwdDivider}/>
        </View>
    </TouchableOpacity>
);

export const InputItem = (props: any) => (
    <TouchableOpacity onPress={props.onPress}>
        <View style={styles.pwdView}>
            <View style={styles.pwdContainer}>
                <View style={{flex: 1}}>{props.leftElement}</View>
                <View style={{flex: 9}}>
                    {props.rightElement}
                </View>
            </View>
            <View style={styles.pwdDivider}/>
        </View>
    </TouchableOpacity>
);

export const ListItem = (props: any) => (
    <TouchableOpacity onPress={props.onPress}>
        <View style={styles.pwdView}>
            <View style={styles.pwdContainer}>
                <View style={{flex: 1}}>
                    {Utils.isEmpty(props.leftElement) ? null : props.leftElement}
                </View>
                <View style={{flex: 4}}>
                    {Utils.isEmpty(props.title) ? null : <Text style={{
                        fontSize: 16
                    }}>{props.title}</Text>}
                    {Utils.isEmpty(props.subtitle) ? null : <Text>{props.subtitle}</Text>}
                </View>
                <View style={{flex: 4, justifyContent: 'flex-end', flexDirection: 'row'}}>
                    {Utils.isEmpty(props.rightElement) ? null : props.rightElement}
                    {Utils.isEmpty(props.rightTitle) ? null : <Text>{props.rightTitle}</Text>}
                </View>
            </View>
            {props.bottomDivider === true ? <View style={styles.pwdDivider}/> : null}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    pwdView: {
        flexDirection: "column",
        alignItems: "center",
        marginTop: 20
    },
    textInput: {
        textAlign: 'right',
        fontSize: 16
    },
    pwdContainer: {
        flexDirection: "row",
        // height: 50,
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20
    },
    pwdDivider: {
        width: width - 40,
        marginLeft: 20,
        marginRight: 20,
        height: 1,
        backgroundColor: "lightgray"
    },
    trackingView: {
        ...Platform.select({
            ios: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0
            }
        })
    }
});
