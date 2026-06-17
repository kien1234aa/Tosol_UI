/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { setupFirebaseBackgroundHandler } from '@/src/push/firebaseBackgroundHandler';
import App from './App';
import { name as appName } from './app.json';

setupFirebaseBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
