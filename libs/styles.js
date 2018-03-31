import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000'
  },
  animatedContainer: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    alignSelf: 'stretch'
  },
  contentContainer: {
    flex: 1,
    alignSelf: 'stretch'
  }
})
