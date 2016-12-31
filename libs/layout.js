/* @flow */
import {Platform, StatusBar, Dimensions} from 'react-native';

export const statusBarHeight = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
export const {height: deviceHeight, width: deviceWidth} = Dimensions.get('window');
export const visibleHeight = deviceHeight - statusBarHeight;
