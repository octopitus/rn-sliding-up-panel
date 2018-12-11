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
    onDragStart: () => {},
    onDragEnd: () => {},
    allowMomentum: true,
    allowDragging: true,
    showBackdrop: true,
    backdropOpacity: 0.75,
  }

  // eslint-disable-next-line react/sort-comp
  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
    onPanResponderGrant: this._onPanResponderGrant.bind(this),
    onPanResponderMove: this._onPanResponderMove.bind(this),
    onPanResponderRelease: this._onPanResponderRelease.bind(this),
    onPanResponderTerminate: this._onPanResponderTerminate.bind(this),
    onShouldBlockNativeResponder: () => false,
    onPanResponderTerminationRequest: () => false,
  })

  _keyboardShowListener = Keyboard.addListener(
    keyboardShowEvent,
    this._onKeyboardShown.bind(this)
  )

  _keyboardHideListener = Keyboard.addListener(
    keyboardHideEvent,
    this._onKeyboardHiden.bind(this)
  )

  constructor(props) {
    super(props)

    this._storeKeyboardPosition = this._storeKeyboardPosition.bind(this)
    this._isInsideDraggableRange = this._isInsideDraggableRange.bind(this)
    this._triggerAnimation = this._triggerAnimation.bind(this)
    this._renderContent = this._renderContent.bind(this)
    this._renderBackdrop = this._renderBackdrop.bind(this)

    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.scrollIntoView = this.scrollIntoView.bind(this)

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
    this._animatedValueListener = this.props.animatedValue.addListener(this._onDrag.bind(this)) // prettier-ignore
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

    if (this._animatedValueListener != null) {
      this.props.animatedValue.removeListener(this._animatedValueListener)
    }
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    return (
      this.props.allowDragging &&
      this._isInsideDraggableRange(-this._animatedValueY) &&
      Math.abs(gestureState.dy) > this.props.minimumDistanceThreshold
    )
  }

  _onPanResponderGrant(evt, gestureState) {
    this._flick.stop()

    const { top, bottom } = this.props.draggableRange
    const value = this.props.animatedValue.__getValue()

    this._animatedValueY = clamp(value, -top, -bottom)
    this._panResponderGrant = true
    this.props.onDragStart(-this._animatedValueY)
  }

  _onPanResponderMove(evt, gestureState) {
    this.props.animatedValue.setValue(this._animatedValueY + gestureState.dy)
  }

  // Trigger when you release your finger
  _onPanResponderRelease(evt, gestureState) {
    this._panResponderGrant = false

    if (!this._isInsideDraggableRange(-this._animatedValueY)) {
      return
    }

    this.props.onDragEnd(-this._animatedValueY)

    if (!this.props.allowMomentum || this._flick.isActive()) {
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
    // If the animation is triggered from outside
    if (!this._panResponderGrant) {
      this._animatedValueY = value
    }

    const isAtBottom = this._isAtBottom(value)

    if (isAtBottom) {
      Keyboard.dismiss()
    }

    if (this._backdrop == null) {
      return
    }

    if (isAtBottom) {
      this._backdrop.setNativeProps({ pointerEvents: 'none' })
    } else if (!this._isAtBottom(this._animatedValueY)) {
      this._backdrop.setNativeProps({ pointerEvents: 'box-only' })
    }
  }

  _onKeyboardShown(event) {
    if (!this.props.avoidKeyboard) {
      return
    }

    this._storeKeyboardPosition(event.endCoordinates.screenY)

    const node = TextInput.State.currentlyFocusedField()

    if (node != null) {
      this.scrollIntoView(node)
    }
  }

  _onKeyboardHiden() {
    this._storeKeyboardPosition(0)

    // Restore last position
    if (this._lastPosition != null && !this._isAtBottom(this._animatedValueY)) {
      this.show(this._lastPosition)
    }

    this._lastPosition = null
  }

  _isInsideDraggableRange(value) {
    const { top, bottom } = this.props.draggableRange
    return value <= top && value >= bottom
  }

  _isAtBottom(value) {
    const { bottom } = this.props.draggableRange
    return value >= -bottom
  }

  _triggerAnimation(options = {}) {
    this._flick.setActive(true)

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

    animation.start(({ finished }) => {
      this._flick.setActive(false)
      onAnimationEnd(finished)
    })
  }

  _storeKeyboardPosition(value) {
    this._keyboardYPosition = value
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
        onTouchEnd={() => this.hide()}
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

  show(mayBeValueOrOptions) {
    if (!mayBeValueOrOptions) {
      const { top } = this.props.draggableRange
      return this._triggerAnimation({ toValue: top })
    }

    if (typeof mayBeValueOrOptions === 'object') {
      return this._triggerAnimation(mayBeValueOrOptions)
    }

    return this._triggerAnimation({ toValue: mayBeValueOrOptions })
  }

  hide() {
    const { bottom } = this.props.draggableRange
    this._triggerAnimation({ toValue: bottom })
  }

  async scrollIntoView(node, options = {}) {
    if (!this._keyboardYPosition) {
      return
    }

    this._flick.stop()

    const { y } = await measureElement(node)
    const extraMargin = options.keyboardExtraMargin || EXTRA_MARGIN

    if (y > this._keyboardYPosition - extraMargin) {
      const animatedValue = this.props.animatedValue.__getValue()
      const fromNodeToKeyboard = y - (this._keyboardYPosition - extraMargin)
      const transitionDistance = -animatedValue + fromNodeToKeyboard

      this._lastPosition = animatedValue
      this.show(transitionDistance)
    }
  }
}

export default SlidingUpPanel
