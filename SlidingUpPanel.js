/* @flow */

import React from 'react'
import {Modal, View, TouchableWithoutFeedback, Animated, PanResponder} from 'react-native'

import {visibleHeight} from './libs/layout'
import FlickAnimation from './libs/FlickAnimation'
import styles from './libs/styles'

const VMAX = 1.67

class SlidingUpPanel extends React.Component {

  static propsTypes = {
    height: React.PropTypes.number,
    initialPosition: React.PropTypes.number,
    onShow: React.PropTypes.func,
    onMove: React.PropTypes.func,
    onHide: React.PropTypes.func,
    contentContainerStyle: React.PropTypes.Object
  };

  static defaultProps = {
    height: visibleHeight,
    onShow: () => {},
    onHide: () => {},
    onMove: () => {}
  };

  _panResponder: any;

  _animatedValueY = 0;
  _translateYAnimation = new Animated.Value(0);
  _flick = new FlickAnimation(this._translateYAnimation);

  state = {visible: false};

  componentWillMount() {
    this._translateYAnimation.addListener(this._onMove)

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._onStartShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this)
    })
  }

  componentWillUnmount() {
    this._translateYAnimation.removeListener(this._onMove)
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetPanResponder(evt, gestureState) {
    this._flick.stop()
    return true
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetResponderCapture(evt, gestureState) {
    return true
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    this._flick.stop()

    if (this._animatedValueY <= -this.props.height) {
      return gestureState.dy > 0
    }

    return Math.abs(gestureState.dy) > 0
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderGrant(evt, gestureState) {
    this._translateYAnimation.setOffset(this._animatedValueY)
    this._translateYAnimation.setValue(0)
  }

  _onPanResponderMove(evt, gestureState) {
    if (
      this._animatedValueY + gestureState.dy <= -this.props.height
    ) {
      return
    }

    this._translateYAnimation.setValue(gestureState.dy)
  }

  _onPanResponderRelease(evt, gestureState) {
    if (
      this._animatedValueY <= -this.props.height &&
      gestureState.dy <= 0
    ) {
      return
    }

    this._translateYAnimation.flattenOffset()

    const velocity = gestureState.vy

    if (this._animatedValueY >= -this.props.height / 2) {
      this.hide()
      return
    }

    // Predict if the panel closes in 20 frames
    const _delta = 325 * velocity
    const _nextValueY = this._animatedValueY + _delta

    if (
      (_nextValueY >= -this.props.height / 2 && gestureState.vy > 0) ||
      velocity >= VMAX
    ) {
      this.hide()
      return
    }

    if (Math.abs(gestureState.vy) > 0.1) {
      this._flick.start({velocity, fromValue: this._animatedValueY})
    }

    return
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderTerminate(evt, gestureState) {
    //
  }

  _onMove = ({value}: {value: number}): void => {
    this._animatedValueY = value
    this.props.onMove(value)
    if (this._animatedValueY >= 0 && this.state.visible) {
      this.setState({visible: false})
    }
  }

  _startShowAnimation = (): void => {
    const animationConfig = {
      duration: 220,
      toValue: -(this.props.initialPosition || this.props.height)
    }

    Animated.timing(
      this._translateYAnimation,
      animationConfig
    ).start(() => {
      if (__DEV__) {
        console.log('shown')
      }

      this.props.onShow()
    })
  }

  render(): ?React.Element<any> {
    const translateY = this._translateYAnimation.interpolate({
      inputRange: [-this.props.height, 0],
      outputRange: [-this.props.height, 0],
      extrapolate: 'clamp'
    })

    const backdropOpacity = this._translateYAnimation.interpolate({
      inputRange: [-visibleHeight, 0],
      outputRange: [0.75, 0],
      extrapolate: 'clamp'
    })

    const transform = {transform: [{translateY}]}

    const animatedContainerStyles = [
      styles.animatedContainer,
      {height: this.props.height},
      transform
    ]

    return (
      <Modal
        transparent
        animationType='fade'
        onShow={this._startShowAnimation}
        onRequestClose={this.hide}
        visible={this.state.visible}>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPressIn={() => this._flick.stop()} onPress={this.hide}>
            <Animated.View style={[styles.backdrop, {opacity: backdropOpacity}]} />
          </TouchableWithoutFeedback>
          <Animated.View
            {...this._panResponder.panHandlers}
            style={animatedContainerStyles}>
            <View style={this.props.contentContainerStyle}>{this.props.children}</View>
          </Animated.View>
        </View>
      </Modal>
    )
  }

  show = (): void => {
    this.setState({visible: true})
  }

  hide = (): void => {
    this._translateYAnimation.setOffset(0)

    Animated.timing(
      this._translateYAnimation,
      {duration: 220, toValue: 0}
    ).start(() => {
      if (__DEV__) {
        console.log('hidden')
      }

      this.setState({visible: false})
      this.props.onHide()
    })
  }
}

export default SlidingUpPanel
