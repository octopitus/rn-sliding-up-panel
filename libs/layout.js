import {StatusBar, Dimensions} from 'react-native'

module.exports = {
  get visibleHeight() {
    return Dimensions.get('window').height
  },
  get statusBarHeight() {
    return StatusBar.currentHeight || 0
  }
}
