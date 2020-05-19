/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';

// if (!__DEV__) {
//     console.assert('qianyuan!!!!!!!',"asdfasdfasdfasdf");
//     global.console = {
//         info: () => {},
//         log: () => {},
//         assert: () => {},
//         warn: () => {},
//         debug: () => {},
//         error: () => {},
//         time: () => {},
//         timeEnd: () => {},
//     };
// }
// console.ignoredYellowBox = ['Remote debugger'];
AppRegistry.registerComponent(appName, () => App);
