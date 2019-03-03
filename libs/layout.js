import {Dimensions} from 'react-native'

module.exports = {
  get visibleHeight() {
    return Dimensions.get('window').height
  }
}
