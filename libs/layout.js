import {StatusBar, Dimensions} from 'react-native'

export function visibleHeight() {
  return Dimensions.get('window').height
}

export function statusBarHeight() {
  return StatusBar.currentHeight || 0
}
