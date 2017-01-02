/* @flow */
import {StyleSheet} from 'react-native'
import {visibleHeight} from './layout'

export default StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1
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
    top: visibleHeight,
    left: 0,
    right: 0,
    height: visibleHeight,
    alignSelf: 'stretch'
  }
})
