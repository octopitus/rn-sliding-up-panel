import React from 'react'
import PropTypes from 'prop-types'
import { Keyboard, Animated, PanResponder, Platform } from 'react-native'

import clamp from 'clamp'

import FlickAnimation from './libs/FlickAnimation'
import { visibleHeight } from './libs/layout'
import styles from './libs/styles'

const deprecated = (condition, message) => condition && console.warn(message)

const DEFAULT_MINIMUM_VELOCITY_THRESHOLD = 0.1

const DEFAULT_MINIMUM_DISTANCE_THRESHOLD = 0.24

const DEFAULT_SLIDING_DURATION = 240

class SlidingUpPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    height: PropTypes.number,
    draggableRange: PropTypes.shape({
      top: PropTypes.number,
      bottom: PropTypes.number,
    }),
    minimumVelocityThreshold: PropTypes.number,
    minimumDistanceThreshold: PropTypes.number,
    onDrag: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onRequestClose: PropTypes.func,
    startCollapsed: PropTypes.bool,
    allowMomentum: PropTypes.bool,
    allowDragging: PropTypes.bool,
    showBackdrop: PropTypes.bool,
    backdropOpacity: PropTypes.number,
    contentStyle: PropTypes.any,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  }

  static defaultProps = {
    visible: false,
    height: visibleHeight,
    draggableRange: { top: visibleHeight, bottom: 0 },
    minimumVelocityThreshold: DEFAULT_MINIMUM_VELOCITY_THRESHOLD,
    minimumDistanceThreshold: DEFAULT_MINIMUM_DISTANCE_THRESHOLD,
    onDrag: () => {},
    onDragStart: () => {},
    onDragEnd: () => {},
    onRequestClose: () => {},
    allowMomentum: true,
    allowDragging: true,
    showBackdrop: true,
    backdropOpacity: 0.75,
  }

  constructor(props) {
    super(props)

    this._onDrag = this._onDrag.bind(this)
    this._onKeyboardShown = this._onKeyboardShown.bind(this)
    this._onKeyboardHiden = this._onKeyboardHiden.bind(this)
    this._onRequestClose = this._onRequestClose.bind(this)
    this._isInsideDraggableRange = this._isInsideDraggableRange.bind(this)
    this._triggerAnimation = this._triggerAnimation.bind(this)
    this._renderContent = this._renderContent.bind(this)
    this._renderBackdrop = this._renderBackdrop.bind(this)

    this.transitionTo = this.transitionTo.bind(this)

    this.state = {
      visible: props.visible,
      keyboardHeight: 0,
    }

    if (__DEV__) {
      deprecated(
        props.contentStyle,
        'SlidingUpPanel#contentStyle is deprecated. ' +
          'You should wrap your content inside a View.'
      )
    }

    const { top, bottom } = props.draggableRange
    const collapsedPosition = this.props.startCollapsed ? -bottom : -top

    this._animatedValueY = this.state.visible ? collapsedPosition : -bottom
    this._translateYAnimation = new Animated.Value(this._animatedValueY)
    this._flick = new FlickAnimation(this._translateYAnimation, -top, -bottom)

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this),
      onPanResponderTerminationRequest: () => false,
    })

    this._backdrop = null
    this._isAtBottom = !props.visible
    this._requestCloseTriggered = false

    this._translateYAnimation.addListener(this._onDrag)
    this._keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._onKeyboardShown
    )
    this._keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._onKeyboardHiden
    )
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this._requestCloseTriggered = false

      this.setState({ visible: true }, () => {
        this.transitionTo(-this.props.draggableRange.top)
      })
      return
    }

    const { bottom } = this.props.draggableRange

    if (
      !nextProps.visible &&
      this.props.visible &&
      -this._animatedValueY > bottom
    ) {
      this._requestCloseTriggered = true

      this.transitionTo({
        toValue: -bottom,
        onAnimationEnd: () => this.setState({ visible: false }),
      })
      return
    }

    if (
      nextProps.draggableRange.top !== this.props.draggableRange.top ||
      nextProps.draggableRange.bottom !== this.props.draggableRange.bottom
    ) {
      const { top, bottom } = nextProps.draggableRange
      this._flick.setMin(-top)
      this._flick.setMax(-bottom)
    }
  }

  componentWillUnmount() {
    if (this._keyboardDidShowListener != null) {
      this._keyboardDidShowListener.remove()
    }

    if (this._keyboardDidHideListener != null) {
      this._keyboardDidHideListener.remove()
    }
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    return (
      this.props.allowDragging &&
      this._isInsideDraggableRange() &&
      Math.abs(gestureState.dy) > this.props.minimumDistanceThreshold
    )
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderGrant(evt, gestureState) {
    this._flick.stop()
    this._translateYAnimation.setOffset(this._animatedValueY)
    this._translateYAnimation.setValue(0)
    this.props.onDragStart(-this._animatedValueY)
  }

  _onPanResponderMove(evt, gestureState) {
    if (!this._isInsideDraggableRange()) {
      return
    }

    this._translateYAnimation.setValue(gestureState.dy)
  }

  // Trigger when you release your finger
  _onPanResponderRelease(evt, gestureState) {
    if (!this._isInsideDraggableRange()) {
      return
    }

    this._translateYAnimation.flattenOffset()
    const cancelFlick = this.props.onDragEnd(-this._animatedValueY)

    if (!this.props.allowMomentum || cancelFlick) {
      return
    }

    if (Math.abs(gestureState.vy) > this.props.minimumVelocityThreshold) {
      this._flick.start({
        velocity: gestureState.vy,
        fromValue: this._animatedValueY,
      })
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _onPanResponderTerminate(evt, gestureState) {
    //
  }

  _onRequestClose() {
    Keyboard.dismiss()
    this.props.onRequestClose()
  }

  _onDrag({ value }) {
    const { top, bottom } = this.props.draggableRange

    if (value >= -bottom) {
      this._isAtBottom = true

      if (this._backdrop != null) {
        this._backdrop.setNativeProps({ pointerEvents: 'none' })
      }

      if (!this._requestCloseTriggered) {
        this._onRequestClose()
      }
      return
    }

    if (this._isAtBottom) {
      this._isAtBottom = false

      if (this._backdrop != null) {
        this._backdrop.setNativeProps({ pointerEvents: 'box-only' })
      }
    }

    const keyboardHeight = this.state.keyboardHeight
    this._animatedValueY = clamp(value, -top - keyboardHeight, -bottom)
    this.props.onDrag(-this._animatedValueY)
  }

  _onKeyboardShown(event) {
    const { top } = this.props.draggableRange
    const { height } = event.endCoordinates

    this._flick.setMin(-top - height)
    this.setState({ keyboardHeight: height })
  }

  _onKeyboardHiden() {
    const { top } = this.props.draggableRange

    this._flick.setMin(-top)
    this.setState({ keyboardHeight: 0 })
  }

  _isInsideDraggableRange() {
    const keyboardHeight = this.state.keyboardHeight
    const { top, bottom } = this.props.draggableRange

    return (
      this._animatedValueY >= -top - keyboardHeight &&
      this._animatedValueY <= -bottom
    )
  }

  _triggerAnimation(options = {}) {
    const {
      toValue,
      easing,
      onAnimationEnd = () => {},
      duration = DEFAULT_SLIDING_DURATION,
    } = options

    const animationConfig = {
      duration,
      easing,
      toValue: -Math.abs(toValue),
      delay: Platform.OS === 'android' ? 166.67 : undefined, // to make it looks smooth on android
    }

    const animation = Animated.timing(
      this._translateYAnimation,
      animationConfig
    )

    animation.start(onAnimationEnd)
  }

  _renderBackdrop() {
    if (!this.props.showBackdrop) {
      return null
    }

    const keyboardHeight = this.state.keyboardHeight
    const { top, bottom } = this.props.draggableRange

    const backdropOpacity = this._translateYAnimation.interpolate({
      inputRange: [-top - keyboardHeight, -bottom],
      outputRange: [this.props.backdropOpacity, 0],
      extrapolate: 'clamp',
    })

    return (
      <Animated.View
        key="backdrop"
        pointerEvents="box-only"
        ref={c => (this._backdrop = c)}
        onTouchStart={() => this._flick.stop()}
        onTouchEnd={this._onRequestClose}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      />
    )
  }

  _renderContent() {
    const keyboardHeight = this.state.keyboardHeight
    const { top, bottom } = this.props.draggableRange
    const height = this.props.height

    const translateY = this._translateYAnimation.interpolate({
      inputRange: [-top - keyboardHeight, -bottom],
      outputRange: [-top - keyboardHeight, -bottom],
      extrapolate: 'clamp',
    })

    const transform = { transform: [{ translateY }] }

    const animatedContainerStyles = [
      styles.animatedContainer,
      transform,
      { height, top: visibleHeight, bottom: 0 },
    ]

    if (typeof this.props.children === 'function') {
      return (
        <Animated.View
          key="content"
          pointerEvents="box-none"
          style={animatedContainerStyles}>
          {this.props.children(this._panResponder.panHandlers)}
        </Animated.View>
      )
    }

    return (
      <Animated.View
        key="content"
        pointerEvents="box-none"
        style={animatedContainerStyles}
        {...this._panResponder.panHandlers}>
        {this.props.children}
      </Animated.View>
    )
  }

  render() {
    if (!this.state.visible) {
      return null
    }

    return [this._renderBackdrop(), this._renderContent()]
  }

  transitionTo(mayBeValueOrOptions) {
    if (typeof mayBeValueOrOptions === 'object') {
      return this._triggerAnimation(mayBeValueOrOptions)
    }

    return this._triggerAnimation({ toValue: mayBeValueOrOptions })
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  reactToKeyboardEvent(node) {
    //
  }
}

export default SlidingUpPanel
