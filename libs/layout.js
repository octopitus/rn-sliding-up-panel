import {Platform, StatusBar, Dimensions} from 'react-native'

const statusBarHeight = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
const {height: deviceHeight} = Dimensions.get('window')

export const visibleHeight = deviceHeight - statusBarHeight
