import * as React from 'react';
import {Text, View, SafeAreaView} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

function HomeScreen() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Home!</Text>
        </View>
    );
}

function SettingsScreen() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Settings!</Text>
        </View>
    );
}

import pagesWdIndex from './pages/wd/index';
import pagesXxIndex from './pages/xx/index';
import pagesGcIndex from './pages/gc/index';
import pagesThlIndex from './pages/thl/index';
import pagesMessage from './pages/message/Message';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
            <NavigationContainer>
                <Tab.Navigator>
                    <Tab.Screen name="Home" component={pagesThlIndex}/>
                    <Tab.Screen name="Settings" component={pagesWdIndex}/>
                </Tab.Navigator>
            </NavigationContainer>
    );
}
