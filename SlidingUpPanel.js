/* @flow */
import React from 'react'
import {Modal, View, TouchableWithoutFeedback, Animated, PanResponder} from 'react-native'

import {visibleHeight} from './libs/layout'
import FlickAnimation from './libs/FlickAnimation'
import styles from './libs/styles'

const VMAX = 1.67

type State = {
  visible: boolean,
  translateYAnimation: Animated.Value
}

type Props = {
  onPanelMove: (value: number) => void,
  contentContainerStyle: Object,
  children?: any
}

class SlidingUpPanel extends React.Component {

  static defaultProps: Props
  props: Props
  state: State

  _panResponder: any
  _animatedValueY: number
  _flick: FlickAnimation

  constructor(props: Props) {
    super(props)

    this._animatedValueY = 0

    this.state = {
      visible: false,
      translateYAnimation: new Animated.Value(0)
    }
  }

  componentWillMount() {
    this.state.translateYAnimation.addListener(this.onPanelMove)

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._onStartShouldSetPanResponder.bind(this),
      onStartShouldSetResponderCapture: this._onStartShouldSetResponderCapture.bind(this),
      onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
      onMoveShouldSetResponderCapture: this._onMoveShouldSetResponderCapture.bind(this),
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this)
    })
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return nextState.visible !== this.state.visible
  }

  componentWillUnmount() {
    this.state.translateYAnimation.removeListener(this.onPanelMove)
  }

  _onStartShouldSetPanResponder(evt, gestureState) {
    if (this._flick) {
      this._flick.stop()
    }

    return true
  }

  _onStartShouldSetResponderCapture(evt, gestureState) {
    return true
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    if (this._flick) {
      this._flick.stop()
    }

    if (this._animatedValueY <= -visibleHeight) {
      return gestureState.dy > 1
    }

    return Math.abs(gestureState.dy) > 1
  }

  _onMoveShouldSetResponderCapture(evt, gestureState) {
    return true
  }

  _onPanResponderGrant(evt, gestureState) {
    this.state.translateYAnimation.setOffset(this._animatedValueY)
    this.state.translateYAnimation.setValue(0)
  }

  _onPanResponderMove(evt, gestureState) {
    if (
      this._animatedValueY <= -visibleHeight &&
      gestureState.dy < 0
    ) {
      return
    }

    this.state.translateYAnimation.setValue(gestureState.dy)
  }

  _onPanResponderRelease(evt, gestureState) {
    if (
      this._animatedValueY <= -visibleHeight &&
      gestureState.dy < 0
    ) {
      return
    }

    this.state.translateYAnimation.flattenOffset()

    const velocity: number = gestureState.vy

    // Predict if the panel closes in 20 frames
    const _delta = 325 * velocity
    const _nextValueY = this._animatedValueY + _delta

    if (velocity >= VMAX || (_nextValueY >= -visibleHeight / 2 && gestureState.vy > 0)) {
      this.hide()
      return
    }

    if (Math.abs(gestureState.vy) > 0.1) {
      this._flick = new FlickAnimation(this.state.translateYAnimation)
      this._flick.start({velocity, fromValue: this._animatedValueY})
    }

    return
  }

  _onPanResponderTerminate(evt, gestureState) {
    //
  }

  render(): ?React.Element<any> {
    const translateY = this.state.translateYAnimation

    const backdropOpacity = this.state.translateYAnimation.interpolate({
      inputRange: [-visibleHeight, 0],
      outputRange: [0.75, 0]
    })

    const transform = {transform: [{translateY}]}

    const contentContainerStyle = this.props.contentContainerStyle

    return (
      <Modal
        transparent
        animationType='fade'
        onRequestClose={this.hide}
        visible={this.state.visible}>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPressIn={() => this._flick && this._flick.stop()} onPress={this.hide}>
            <Animated.View style={[styles.backdrop, {opacity: backdropOpacity}]} />
          </TouchableWithoutFeedback>
          <Animated.View
            {...this._panResponder.panHandlers}
            style={[styles.contentContainer, contentContainerStyle, transform]}>
            {this.props.children}
          </Animated.View>
        </View>
      </Modal>
    )
  }

  onPanelMove = ({value}: {value: number}): void => {
    this._animatedValueY = value
    this.props.onPanelMove(value)
    if (this._animatedValueY >= 0 && this.state.visible) {
      this.hide()
    }
  }

  show = (config?: {duration: number, easing?: any}): void => {
    this.setState({visible: true}, () => {
      Animated.timing(this.state.translateYAnimation, {
        duration: 220,
        ...config,
        toValue: -visibleHeight / 2
      }).start()
    })
  }

  hide = (callback?: Function): void => {
    this.state.translateYAnimation.setOffset(0)

    const animation = Animated.timing(this.state.translateYAnimation, {
      duration: 220,
      toValue: 0
    })

    animation.start(() => {
      this.setState({visible: false})
      typeof callback === 'function' && callback()
    })
  }
}

SlidingUpPanel.defaultProps = {
  onPanelMove: () => {},
  contentContainerStyle: {}
}

export default SlidingUpPanel
