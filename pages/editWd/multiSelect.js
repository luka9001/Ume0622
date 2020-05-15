import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Dimensions,SafeAreaView} from "react-native";
import {Button, Icon} from "react-native-elements";
import MultiSelect from 'react-native-multiple-select';
import serverConfig from '../service/config';
import CommonTitleBar from '../views/CommonTitleBar';

let {width} = Dimensions.get('window');

const image = {
    width: 20,
    height: 20,
    marginRight: 5
};

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItems: []
        }
    }

    onSelectedItemsChange = (selectedItems) => {
        this.setState({
            selectedItems
        });
        // switch (this.props.navigation.state.params.id) {
        //   case 1:
        //     // this.props.language(selectedItems);
        //     cache.language = selectedItems;
        //     break;
        //   case 2:
        //     // this.props.nlanguage(selectedItems);
        //     cache.nlanguage = selectedItems;
        //     break;
        //   default:
        //     break;
        // }

    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
                <View style={{flex: 1}}>
                    <CommonTitleBar title={'语言'} nav={this.props.navigation}/>
                    <MultiSelect
                        items={serverConfig.languageData}
                        uniqueKey="label"
                        displayKey="value"
                        onSelectedItemsChange={this.onSelectedItemsChange}
                        selectedItems={this.state.selectedItems}
                        selectText="选择语言"
                        searchInputPlaceholderText="搜索"
                        tagRemoveIconColor="#63B8FF"
                        tagBorderColor="#63B8FF"
                        tagTextColor="#63B8FF"
                        selectedItemTextColor="#63B8FF"
                        selectedItemIconColor="#63B8FF"
                        itemTextColor="#000"
                        searchInputStyle={{color: '#63B8FF'}}
                        submitButtonColor="#63B8FF"
                        submitButtonText="确认"
                    />
                    <View style={styles.contentFindView}>
                        <Button
                            icon={<Icon
                                name='check'
                                type='material-community'
                                color='white'
                                size={20}
                                iconStyle={image}
                            />}
                            title="确认"
                            type="solid"
                            raised={true}
                            onPress={() => {
                                this.props.navigation.goBack();
                                this.props.navigation.state.params.dis(this.props.navigation.state.params.id, this.state.selectedItems)
                            }}
                            buttonStyle={{backgroundColor: '#63B8FF', borderRadius: 15, height: 45}}
                            containerStyle={{margin: 5, flex: 4, borderRadius: 15}}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingTop: 3,
        paddingRight: 3,
        paddingBottom: 3,
        margin: 3,
        borderRadius: 20,
        borderWidth: 2,
    },
    contentFindView: {
        flex: 1,
        width: width,
        position: "absolute",
        bottom: 5,
        justifyContent: 'space-around',
        flexDirection: 'row'
    },
});

export default Index;
