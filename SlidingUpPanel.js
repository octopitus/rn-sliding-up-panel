import React from 'react'
import PropTypes from 'prop-types'
import clamp from 'clamp'

import {
  TextInput,
  Keyboard,
  BackHandler,
  Animated,
  PanResponder,
  Platform
} from 'react-native'

import FlickAnimation from './libs/FlickAnimation'
import measureElement from './libs/measureElement'
import * as Constants from './libs/constants'
import {visibleHeight} from './libs/layout'
import styles from './libs/styles'

const keyboardShowEvent = Platform.select({
  android: 'keyboardDidShow',
  ios: 'keyboardWillShow'
})

const keyboardHideEvent = Platform.select({
  android: 'keyboardDidHide',
  ios: 'keyboardWillHide'
})

class SlidingUpPanel extends React.PureComponent {
  static propTypes = {
    height: PropTypes.number,
    animatedValue: PropTypes.instanceOf(Animated.Value),
    draggableRange: PropTypes.shape({
      top: PropTypes.number,
      bottom: PropTypes.number
    }),
    minimumVelocityThreshold: PropTypes.number,
    minimumDistanceThreshold: PropTypes.number,
    avoidKeyboard: PropTypes.bool,
    onBackButtonPress: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    allowMomentum: PropTypes.bool,
    allowDragging: PropTypes.bool,
    showBackdrop: PropTypes.bool,
    backdropOpacity: PropTypes.number,
    friction: PropTypes.number,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
  }

  static defaultProps = {
    height: visibleHeight,
    animatedValue: new Animated.Value(0),
    draggableRange: {top: visibleHeight, bottom: 0},
    minimumVelocityThreshold: Constants.DEFAULT_MINIMUM_VELOCITY_THRESHOLD,
    minimumDistanceThreshold: Constants.DEFAULT_MINIMUM_DISTANCE_THRESHOLD,
    avoidKeyboard: true,
    onBackButtonPress: () => false,
    onDragStart: () => {},
    onDragEnd: () => {},
    allowMomentum: true,
    allowDragging: true,
    showBackdrop: true,
    backdropOpacity: 0.75,
    friction: Constants.DEFAULT_FRICTION
  }

  // eslint-disable-next-line react/sort-comp
  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => this.props.allowDragging,
    onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
    onPanResponderGrant: this._onPanResponderGrant.bind(this),
    onPanResponderMove: this._onPanResponderMove.bind(this),
    onPanResponderRelease: this._onPanResponderRelease.bind(this),
    onPanResponderTerminate: this._onPanResponderTerminate.bind(this),
    onShouldBlockNativeResponder: () => false,
    onPanResponderTerminationRequest: () => false
  })

  _keyboardShowListener = Keyboard.addListener(
    keyboardShowEvent,
    this._onKeyboardShown.bind(this)
  )

  _keyboardHideListener = Keyboard.addListener(
    keyboardHideEvent,
    this._onKeyboardHiden.bind(this)
  )

  _backButtonListener = BackHandler.addEventListener(
    'hardwareBackPress',
    this._onBackButtonPress.bind(this)
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

    const {top, bottom} = this.props.draggableRange
    const currentValue = this.props.animatedValue.__getValue()

    // If the animated value is out of bound
    if (currentValue < bottom) {
      this.props.animatedValue.setValue(bottom)
    } else if (currentValue > top) {
      this.props.animatedValue.setValue(top)
    }

    this._initialDragPosition = currentValue
    this._backdropPointerEvents = this._isAtBottom(currentValue) ? 'none' : 'box-only' // prettier-ignore

    this._flick = new FlickAnimation({
      max: top,
      min: bottom,
      friction: this.props.friction
    })

    this._flickAnimationListener = this._flick.onUpdate(value => {
      this.props.animatedValue.setValue(value)
    })

    this._animatedValueListener = this.props.animatedValue.addListener(
      this._onAnimatedValueChange.bind(this)
    )
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.draggableRange.top !== this.props.draggableRange.top ||
      prevProps.draggableRange.bottom !== this.props.draggableRange.bottom
    ) {
      const {top, bottom} = this.props.draggableRange

      this._flick.setMin(top)
      this._flick.setMax(bottom)
    }

    if (prevProps.friction !== this.props.friction) {
      this._flick.setFriction(this.props.friction)
    }
  }

  componentWillUnmount() {
    if (this._animatedValueListener != null) {
      this.props.animatedValue.removeListener(this._animatedValueListener)
    }

    if (this._keyboardShowListener != null) {
      this._keyboardShowListener.remove()
    }

    if (this._keyboardHideListener != null) {
      this._keyboardHideListener.remove()
    }

    if (this._flickAnimationListener != null) {
      this._flickAnimationListener.remove()
    }

    if (this._backButtonListener != null) {
      this._backButtonListener.remove()
    }
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    if (!this.props.allowDragging) {
      return false
    }

    const animatedValue = this.props.animatedValue.__getValue()

    return (
      this._isInsideDraggableRange(animatedValue) &&
      Math.abs(gestureState.dy) > this.props.minimumDistanceThreshold
    )
  }

  _onPanResponderGrant(evt, gestureState) {
    this._flick.stop()

    const value = this.props.animatedValue.__getValue()

    this._initialDragPosition = value
    this.props.onDragStart(value, gestureState)
  }

  _onPanResponderMove(evt, gestureState) {
    const {top, bottom} = this.props.draggableRange
    const delta = this._initialDragPosition - gestureState.dy
    const newValue = clamp(delta, top, bottom)

    this.props.animatedValue.setValue(newValue)
  }

  // Trigger when you release your finger
  _onPanResponderRelease(evt, gestureState) {
    const animatedValue = this.props.animatedValue.__getValue()

    if (!this._isInsideDraggableRange(animatedValue)) {
      return
    }

    this._initialDragPosition = animatedValue
    this.props.onDragEnd(animatedValue, gestureState)

    if (!this.props.allowMomentum || this._flick.isStarted()) {
      return
    }

    if (Math.abs(gestureState.vy) > this.props.minimumVelocityThreshold) {
      this._flick.start({
        velocity: gestureState.vy,
        fromValue: animatedValue
      })
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _onPanResponderTerminate(evt, gestureState) {
    const animatedValue = this.props.animatedValue.__getValue()

    if (!this._isInsideDraggableRange(animatedValue)) {
      return
    }

    this._initialDragPosition = animatedValue
    this.props.onDragEnd(animatedValue, gestureState)
  }

  _onAnimatedValueChange({value}) {
    const isAtBottom = this._isAtBottom(value)

    if (isAtBottom) {
      Keyboard.dismiss()
    }

    if (this._backdrop == null) {
      return
    }

    // @TODO: Find a better way to update pointer events when animated value changed

    if (isAtBottom && this._backdropPointerEvents === 'box-only') {
      this._backdropPointerEvents = 'none'
      this._backdrop.setNativeProps({pointerEvents: 'none'})
    }

    if (!isAtBottom && this._backdropPointerEvents === 'none') {
      this._backdropPointerEvents = 'box-only'
      this._backdrop.setNativeProps({pointerEvents: 'box-only'})
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

    const animatedValue = this.props.animatedValue.__getValue()

    // Restore last position
    if (this._lastPosition != null && !this._isAtBottom(animatedValue)) {
      Animated.timing(this.props.animatedValue, {
        toValue: this._lastPosition,
        duration: Constants.KEYBOARD_TRANSITION_DURATION
      }).start()
    }

    this._lastPosition = null
  }

  _onBackButtonPress() {
    if (this.props.onBackButtonPress()) {
      return true
    }

    const value = this.props.animatedValue.__getValue()

    if (this._isAtBottom(value)) {
      return false
    }

    this.hide()

    return true
  }

  _isInsideDraggableRange(value) {
    const {top, bottom} = this.props.draggableRange
    return value <= top && value >= bottom
  }

  _isAtBottom(value) {
    const {bottom} = this.props.draggableRange
    return value <= bottom
  }

  _triggerAnimation(options = {}) {
    const animatedValue = this.props.animatedValue.__getValue()
    const remainingDistance = animatedValue - options.toValue
    const velocity = options.velocity || remainingDistance / Constants.DELTA_TIME // prettier-ignore

    this._flick.start({fromValue: animatedValue, velocity})
  }

  _storeKeyboardPosition(value) {
    this._keyboardYPosition = value
  }

  _renderBackdrop() {
    if (!this.props.showBackdrop) {
      return null
    }

    const {top, bottom} = this.props.draggableRange

    const backdropOpacity = this.props.animatedValue.interpolate({
      inputRange: [bottom, top],
      outputRange: [0, this.props.backdropOpacity],
      extrapolate: 'clamp'
    })

    return (
      <Animated.View
        key="backdrop"
        pointerEvents={this._backdropPointerEvents}
        ref={c => (this._backdrop = c)}
        onTouchStart={() => this._flick.stop()}
        onTouchEnd={() => this.hide()}
        style={[styles.backdrop, {opacity: backdropOpacity}]}
      />
    )
  }

  _renderContent() {
    const {top, bottom} = this.props.draggableRange
    const {height} = this.props

    const translateY = this.props.animatedValue.interpolate({
      inputRange: [bottom, top],
      outputRange: [-bottom, -top],
      extrapolate: 'clamp'
    })

    const transform = {transform: [{translateY}]}

    const animatedContainerStyles = [
      styles.animatedContainer,
      transform,
      {height, top: visibleHeight}
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
      const {top} = this.props.draggableRange
      return this._triggerAnimation({toValue: top})
    }

    if (typeof mayBeValueOrOptions === 'object') {
      return this._triggerAnimation(mayBeValueOrOptions)
    }

    return this._triggerAnimation({toValue: mayBeValueOrOptions})
  }

  hide() {
    const {bottom} = this.props.draggableRange
    this._triggerAnimation({toValue: bottom})
  }

  async scrollIntoView(node, options = {}) {
    if (!this._keyboardYPosition) {
      return
    }

    this._flick.stop()

    const {y} = await measureElement(node)
    const extraMargin = options.keyboardExtraMargin || Constants.KEYBOARD_EXTRA_MARGIN // prettier-ignore
    const keyboardActualPos = this._keyboardYPosition - extraMargin

    if (y > keyboardActualPos) {
      this._lastPosition = this.props.animatedValue.__getValue()

      const fromKeyboardToElement = y - keyboardActualPos
      const transitionDistance = this._lastPosition + fromKeyboardToElement

      Animated.timing(this.props.animatedValue, {
        toValue: transitionDistance,
        duration: Constants.KEYBOARD_TRANSITION_DURATION
      }).start()
    }
  }
}

export default SlidingUpPanel
