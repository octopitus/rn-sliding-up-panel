import React from 'react'
import {Modal, View, TouchableWithoutFeedback, Animated, PanResponder, Platform} from 'react-native'

import FlickAnimation from './libs/FlickAnimation'
import {visibleHeight} from './libs/layout'
import styles from './libs/styles'

const VMAX = 1.67

class SlidingUpPanel extends React.Component {

  static propsTypes = {
    height: React.PropTypes.number,
    initialPosition: React.PropTypes.number,
    disableDragging: React.PropTypes.bool,
    onShow: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onHide: React.PropTypes.func,
    contentContainerStyle: React.PropTypes.any
  };

  static defaultProps = {
    disableDragging: false,
    height: visibleHeight,
    onShow: () => {},
    onHide: () => {},
    onDrag: () => {}
  };

  _panResponder: any;

  _animatedValueY = 0;
  _translateYAnimation = new Animated.Value(0);
  _flick = new FlickAnimation(this._translateYAnimation);

  state = {visible: false};

  componentWillMount() {
    this._translateYAnimation.addListener(this._onDrag)

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
    this._translateYAnimation.removeListener(this._onDrag)
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetPanResponder(evt, gestureState) {
    this._flick.stop()
    return !this.props.disableDragging
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    this._flick.stop()

    if (this.props.disableDragging) {
      return false
    }

    if (this._animatedValueY <= -this.props.height) {
      return gestureState.dy > 1
    }

    return Math.abs(gestureState.dy) > 1
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

  _onDrag({value}) {
    this._animatedValueY = value
    this.props.onDrag(value)
    if (this._animatedValueY >= 0 && this.state.visible) {
      this.setState({visible: false})
    }
  }

  _startShowAnimation(config = {}) {
    config.duration = config.duration || 260
    config.toValue = -(this.props.initialPosition || this.props.height)

    Animated.timing(
      this._translateYAnimation,
      config
    ).start(() => this.props.onShow())
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
        onRequestClose={() => this.hide()}
        visible={this.state.visible}>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPressIn={() => this._flick.stop()} onPress={() => this.hide()}>
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

  show(config = {}) {
    if (Platform.OS === 'android') {
      // to make it looks smooth on android
      config.delay = config.delay || 166.67
    }

    this.setState({visible: true}, () => this._startShowAnimation(config))
  }

  hide(config = {}) {
    config.duration = config.duration || 260
    config.toValue = 0

    this._translateYAnimation.setOffset(0)

    Animated.timing(
      this._translateYAnimation,
      config
    ).start(() => {
      this.setState({visible: false})
      this.props.onHide()
    })
  }
}

export default SlidingUpPanel
