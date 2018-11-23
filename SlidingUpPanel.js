import React from 'react'
import PropTypes from 'prop-types'
import invariant from 'invariant'

import {
  TextInput,
  Keyboard,
  Animated,
  PanResponder,
  Platform,
} from 'react-native'

import clamp from 'clamp'

import FlickAnimation from './libs/FlickAnimation'
import measureElement from './libs/measureElement'
import { visibleHeight } from './libs/layout'
import styles from './libs/styles'

const keyboardShowEvent = Platform.select({
  android: 'keyboardDidShow',
  ios: 'keyboardWillShow',
})

const keyboardHideEvent = Platform.select({
  android: 'keyboardDidHide',
  ios: 'keyboardWillHide',
})

const DEFAULT_MINIMUM_VELOCITY_THRESHOLD = 0.1

const DEFAULT_MINIMUM_DISTANCE_THRESHOLD = 0.24

const DEFAULT_SLIDING_DURATION = 240

const EXTRA_MARGIN = 75

class SlidingUpPanel extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    animatedValue: PropTypes.instanceOf(Animated.Value),
    draggableRange: PropTypes.shape({
      top: PropTypes.number,
      bottom: PropTypes.number,
    }),
    minimumVelocityThreshold: PropTypes.number,
    minimumDistanceThreshold: PropTypes.number,
    avoidKeyboard: PropTypes.bool,
    keyboardExtraMargin: PropTypes.number,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    allowMomentum: PropTypes.bool,
    allowDragging: PropTypes.bool,
    showBackdrop: PropTypes.bool,
    backdropOpacity: PropTypes.number,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  }

  static defaultProps = {
    height: visibleHeight,
    animatedValue: new Animated.Value(0),
    draggableRange: { top: visibleHeight, bottom: 0 },
    minimumVelocityThreshold: DEFAULT_MINIMUM_VELOCITY_THRESHOLD,
    minimumDistanceThreshold: DEFAULT_MINIMUM_DISTANCE_THRESHOLD,
    avoidKeyboard: true,
    keyboardExtraMargin: EXTRA_MARGIN,
    onDragStart: () => {},
    onDragEnd: () => {},
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
    this._isInsideDraggableRange = this._isInsideDraggableRange.bind(this)
    this._triggerAnimation = this._triggerAnimation.bind(this)
    this._renderContent = this._renderContent.bind(this)
    this._renderBackdrop = this._renderBackdrop.bind(this)

    this.transitionTo = this.transitionTo.bind(this)

    const { top, bottom } = this.props.draggableRange

    // If draggableRange is represent but not the animatedValue
    if (props.draggableRange != null && props.animatedValue == null) {
      this.props.animatedValue.setValue(-bottom)
    }

    this._animatedValueY = this.props.animatedValue.__getValue()

    if (__DEV__) {
      invariant(
        this._isInsideDraggableRange(-this._animatedValueY),
        'Animated value is out of boundary. It should be within [%s, %s] but %s was given.',
        top,
        bottom,
        this._animatedValueY
      )
    }

    this._flick = new FlickAnimation(this.props.animatedValue, -top, -bottom)

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this),
      onPanResponderTerminationRequest: () => false,
    })

    this._backdrop = null

    this.props.animatedValue.addListener(this._onDrag)
    this._keyboardShowListener = Keyboard.addListener(
      keyboardShowEvent,
      this._onKeyboardShown
    )
    this._keyboardHideListener = Keyboard.addListener(
      keyboardHideEvent,
      this._onKeyboardHiden
    )
  }

  componentWillReceiveProps(nextProps) {
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
    if (this._keyboardShowListener != null) {
      this._keyboardShowListener.remove()
    }
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    return (
      this.props.allowDragging &&
      this._isInsideDraggableRange(-this._animatedValueY) &&
      Math.abs(gestureState.dy) > this.props.minimumDistanceThreshold
    )
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderGrant(evt, gestureState) {
    const { top, bottom } = this.props.draggableRange
    const value = this.props.animatedValue.__getValue()

    this._animatedValueY = clamp(value, -top, -bottom)
    this._flick.stop()
  }

  _onPanResponderMove(evt, gestureState) {
    this.props.animatedValue.setValue(this._animatedValueY + gestureState.dy)
  }

  // Trigger when you release your finger
  _onPanResponderRelease(evt, gestureState) {
    if (!this._isInsideDraggableRange(-this._animatedValueY)) {
      return
    }

    const cancelFlick = this.props.onDragEnd(-this._animatedValueY)

    if (!this.props.allowMomentum || cancelFlick) {
      return
    }

    if (Math.abs(gestureState.vy) > this.props.minimumVelocityThreshold) {
      const fromValue = this.props.animatedValue.__getValue()
      this._flick.start({ velocity: gestureState.vy, fromValue })
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _onPanResponderTerminate(evt, gestureState) {
    //
  }

  _onDrag({ value }) {
    if (this._backdrop == null) {
      return
    }

    if (this._isAtBottom(value)) {
      Keyboard.dismiss()
      this._backdrop.setNativeProps({ pointerEvents: 'none' })
      return
    }

    if (!this._isAtBottom(this._animatedValueY)) {
      this._backdrop.setNativeProps({ pointerEvents: 'box-only' })
    }
  }

  async _onKeyboardShown(event) {
    if (!this.props.avoidKeyboard) {
      return
    }

    const node = TextInput.State.currentlyFocusedField()

    if (node == null) {
      return
    }

    const { screenY } = event.endCoordinates
    const { y } = await measureElement(node)

    const extraHeight = this.props.keyboardExtraMargin
    const fromKeyboardTopEdgeToNode = y - screenY

    if (y > screenY - extraHeight) {
      this._lastPosition = -this._animatedValueY

      const transitionDistance =
        -this._animatedValueY + fromKeyboardTopEdgeToNode + extraHeight

      this.transitionTo(transitionDistance)
    }
  }

  _onKeyboardHiden() {
    if (this._lastPosition != null) {
      this.transitionTo(this._lastPosition)
      this._lastPosition = null
    }
  }

  _isInsideDraggableRange(value) {
    const { top, bottom } = this.props.draggableRange
    return value <= top && value >= bottom
  }

  _isAtBottom(value) {
    const { bottom } = this.props.draggableRange
    return value === -bottom
  }

  _triggerAnimation(options = {}) {
    const {
      toValue,
      easing,
      onAnimationEnd = () => {},
      duration = DEFAULT_SLIDING_DURATION,
    } = options

    const animation = Animated.timing(this.props.animatedValue, {
      duration,
      easing,
      toValue: -Math.abs(toValue),
    })

    animation.start(onAnimationEnd)
  }

  _renderBackdrop() {
    if (!this.props.showBackdrop) {
      return null
    }

    const { top, bottom } = this.props.draggableRange

    const backdropOpacity = this.props.animatedValue.interpolate({
      inputRange: [-top, -bottom],
      outputRange: [this.props.backdropOpacity, 0],
      extrapolate: 'clamp',
    })

    // Initial pointer events
    const pointerEvents = !this._isAtBottom(this._animatedValueY)
      ? 'box-only'
      : 'none'

    return (
      <Animated.View
        key="backdrop"
        pointerEvents={pointerEvents}
        ref={c => (this._backdrop = c)}
        onTouchStart={() => this._flick.stop()}
        onTouchEnd={() => this.transitionTo('bottom')}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      />
    )
  }

  _renderContent() {
    const { top, bottom } = this.props.draggableRange
    const height = this.props.height

    const translateY = this.props.animatedValue.interpolate({
      inputRange: [-top, -bottom],
      outputRange: [-top, -bottom],
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
    return [this._renderBackdrop(), this._renderContent()]
  }

  transitionTo(mayBeValueOrOptions) {
    if (typeof mayBeValueOrOptions === 'object') {
      return this._triggerAnimation(mayBeValueOrOptions)
    }

    const { top, bottom } = this.props.draggableRange

    if (mayBeValueOrOptions === 'top') {
      return this._triggerAnimation({ toValue: top })
    }

    if (mayBeValueOrOptions === 'bottom') {
      return this._triggerAnimation({ toValue: bottom })
    }

    return this._triggerAnimation({ toValue: mayBeValueOrOptions })
  }
}

export default SlidingUpPanel
