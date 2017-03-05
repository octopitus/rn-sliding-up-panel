import React from 'react'
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Platform
} from 'react-native'

import FlickAnimation from './libs/FlickAnimation'
import {visibleHeight} from './libs/layout'
import styles from './libs/styles'

class SlidingUpPanel extends React.Component {
  static propsTypes = {
    visible: React.PropTypes.bool.isRequired,
    onRequestClose: React.PropTypes.func.isRequired,
    height: React.PropTypes.number,
    initialPosition: React.PropTypes.number,
    disableDragging: React.PropTypes.bool,
    onShow: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    showBackdrop: React.PropTypes.bool,
    contentStyle: React.PropTypes.any
  };

  static defaultProps = {
    disableDragging: false,
    height: visibleHeight,
    animationRange: {top: visibleHeight, bottom: 0},
    onShow: () => {},
    onDrag: () => {},
    onRequestClose: () => {},
    showBackdrop: true
  };

  constructor(props) {
    super(props)

    this._onDrag = this._onDrag.bind(this)
    this._requestClose = this._requestClose.bind(this)
    this._transilateTo = this._transilateTo.bind(this)
    this._onAnimationRange = this._onAnimationRange.bind(this)
    this._renderBackdrop = this._renderBackdrop.bind(this)
  }

  componentWillMount() {
    this._animatedValueY = -this.props.animationRange.bottom

    this._translateYAnimation = new Animated.Value(this._animatedValueY)
    this._flick = new FlickAnimation(this._translateYAnimation)

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._onStartShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this)
    })

    this._translateYAnimation.addListener(this._onDrag)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this._transilateTo(
        {toValue: -this.props.animationRange.top},
        () => this.props.onShow()
      )
    }
  }

  componentDidUpdate() {
    const {bottom} = this.props.animationRange
    if (this._animatedValueY !== -bottom && !this.props.visible) {
      this._translateYAnimation.setValue(-bottom)
    }
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetPanResponder(evt, gestureState) {
    return (
      !this.props.disableDragging &&
      this._onAnimationRange(this._animatedValueY)
    )
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    return (
      !this.props.disableDragging &&
      this._onAnimationRange(this._animatedValueY) &&
      Math.abs(gestureState.dy) > 1
    )
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderGrant(evt, gestureState) {
    this._flick.stop()
    this._translateYAnimation.setOffset(this._animatedValueY)
    this._translateYAnimation.setValue(0)
  }

  _onPanResponderMove(evt, gestureState) {
    if (!this._onAnimationRange(this._animatedValueY)) {
      return
    }

    this._translateYAnimation.setValue(gestureState.dy)
  }

  // Trigger when you release your finger
  _onPanResponderRelease(evt, gestureState) {
    if (!this._onAnimationRange(this._animatedValueY)) {
      return
    }

    this._translateYAnimation.flattenOffset()

    if (Math.abs(gestureState.vy) > 0.1) {
      this._flick.start({
        velocity: gestureState.vy,
        fromValue: this._animatedValueY
      })
    }

    return
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderTerminate(evt, gestureState) {
    //
  }

  _onAnimationRange(value) {
    return (
      value >= -this.props.animationRange.top &&
      value <= -this.props.animationRange.bottom
    )
  }

  _onDrag({value}) {
    if (this._onAnimationRange(value)) {
      this._animatedValueY = value
      this.props.onDrag(value)
    }

    if (
      this.props.visible &&
      this._animatedValueY >= -this.props.animationRange.bottom
    ) {
      this.props.onRequestClose()
      return
    }
  }

  _transilateTo(config = {}, onAnimationEnd = () => {}) {
    const animationConfig = {
      toValue: config.toValue,
      duration: config.duration || 260,
      // eslint-disable-next-line no-undefined
      delay: Platform.OS === 'android' ? 166.67 : undefined // to make it looks smooth on android
    }

    Animated.timing(
      this._translateYAnimation,
      animationConfig
    ).start(onAnimationEnd)
  }

  _requestClose() {
    return this._transilateTo(
      {toValue: -this.props.animationRange.bottom},
      () => this.props.onRequestClose()
    )
  }

  _renderBackdrop() {
    if (!this.props.showBackdrop) {
      return null
    }

    const {top, bottom} = this.props.animationRange

    const backdropOpacity = this._translateYAnimation.interpolate({
      inputRange: [-top, -bottom],
      outputRange: [0.75, bottom / visibleHeight],
      extrapolate: 'clamp'
    })

    return (
      <TouchableWithoutFeedback
        onPressIn={() => this._flick.stop()}
        onPress={() => this._requestClose()}>
        <Animated.View style={[styles.backdrop, {opacity: backdropOpacity}]} />
      </TouchableWithoutFeedback>
    )
  }

  render() {
    const {top, bottom} = this.props.animationRange

    const translateY = this._translateYAnimation.interpolate({
      inputRange: [-top, -bottom],
      outputRange: [-top, -bottom],
      extrapolate: 'clamp'
    })

    const transform = {transform: [{translateY}]}

    const animatedContainerStyles = [
      styles.animatedContainer,
      {top: this.props.height},
      {height: this.props.height},
      transform
    ]

    return (
      <Modal
        transparent
        animationType='fade'
        onRequestClose={() => this._requestClose()}
        visible={this.props.visible}>
        <View style={styles.container}>
          {this._renderBackdrop()}
          <Animated.View {...this._panResponder.panHandlers} style={animatedContainerStyles}>
            <View style={this.props.contentStyle}>
              {this.props.children}
            </View>
          </Animated.View>
        </View>
      </Modal>
    )
  }
}

export default SlidingUpPanel
