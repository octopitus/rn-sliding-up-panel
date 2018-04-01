import React from 'react'
import PropTypes from 'prop-types'
import {
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Platform
} from 'react-native'

import clamp from 'clamp'

import FlickAnimation from './libs/FlickAnimation'
import {visibleHeight} from './libs/layout'
import styles from './libs/styles'

const deprecated = (condition, message) => condition && console.warn(message)

class SlidingUpPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    draggableRange: PropTypes.shape({
      top: PropTypes.number,
      bottom: PropTypes.number
    }),
    height: PropTypes.number,
    onDrag: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onRequestClose: PropTypes.func,
    allowMomentum: PropTypes.bool,
    allowDragging: PropTypes.bool,
    showBackdrop: PropTypes.bool,
    contentStyle: PropTypes.any,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
  }

  static defaultProps = {
    visible: false,
    height: visibleHeight,
    draggableRange: {top: visibleHeight, bottom: 0},
    onDrag: () => {},
    onDragStart: () => {},
    onDragEnd: () => {},
    onRequestClose: () => {},
    allowMomentum: true,
    allowDragging: true,
    showBackdrop: true
  }

  constructor(props) {
    super(props)

    this._onDrag = this._onDrag.bind(this)
    this._requestClose = this._requestClose.bind(this)
    this._renderContent = this._renderContent.bind(this)
    this._renderBackdrop = this._renderBackdrop.bind(this)
    this._isInsideDraggableRange = this._isInsideDraggableRange.bind(this)
    this._triggerAnimation = this._triggerAnimation.bind(this)

    this.transitionTo = this.transitionTo.bind(this)
  }

  componentWillMount() {
    if (__DEV__) {
      deprecated(
        this.props.contentStyle,
        'SlidingUpPanel#contentStyle is deprecated. ' +
          'You should wrap your content inside a View.'
      )
    }

    const {top, bottom} = this.props.draggableRange

    this._animatedValueY = this.props.visible ? -top : -bottom
    this._translateYAnimation = new Animated.Value(this._animatedValueY)
    this._flick = new FlickAnimation(this._translateYAnimation, -top, -bottom)

    this._panResponder = PanResponder.create({
      // prettier-ignore
      onStartShouldSetPanResponder: this._onStartShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this),
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false
    })

    this._translateYAnimation.addListener(this._onDrag)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.transitionTo(-this.props.draggableRange.top)
    }

    if (
      nextProps.draggableRange.top !== this.props.draggableRange.top ||
      nextProps.draggableRange.bottom !== this.props.draggableRange.bottom
    ) {
      const {top, bottom} = nextProps.draggableRange
      this._flick = new FlickAnimation(this._translateYAnimation, -top, -bottom)
    }
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetPanResponder(evt, gestureState) {
    return this.props.allowDragging && this._isInsideDraggableRange()
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    return (
      this.props.allowDragging &&
      this._isInsideDraggableRange() &&
      Math.abs(gestureState.dy) > 1
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

  _isInsideDraggableRange() {
    const {top, bottom} = this.props.draggableRange
    return this._animatedValueY >= -top && this._animatedValueY <= -bottom
  }

  _onDrag({value}) {
    const {top, bottom} = this.props.draggableRange

    if (value >= -bottom) {
      this.props.onRequestClose()
      return
    }

    this._animatedValueY = clamp(value, -top, -bottom)
    this.props.onDrag(-this._animatedValueY)
  }

  transitionTo(mayBeValueOrOptions) {
    if (typeof mayBeValueOrOptions === 'object') {
      return this._triggerAnimation(mayBeValueOrOptions)
    }

    return this._triggerAnimation({toValue: mayBeValueOrOptions})
  }

  _triggerAnimation(options = {}) {
    const {toValue, easing, onAnimationEnd = () => {}, duration = 260} = options

    const animationConfig = {
      duration,
      easing,
      toValue: -Math.abs(toValue),
      delay: Platform.OS === 'android' ? 166.67 : undefined // to make it looks smooth on android
    }

    const animation = Animated.timing(
      this._translateYAnimation,
      animationConfig
    )

    animation.start(onAnimationEnd)
  }

  _requestClose() {
    const {bottom} = this.props.draggableRange
    if (this._animatedValueY === -bottom) {
      return this.props.onRequestClose()
    }

    return this.transitionTo(-this.props.draggableRange.bottom, () =>
      this.props.onRequestClose()
    )
  }

  _renderBackdrop() {
    if (!this.props.showBackdrop) {
      return null
    }

    const {top, bottom} = this.props.draggableRange

    const backdropOpacity = this._translateYAnimation.interpolate({
      inputRange: [-top, -bottom],
      outputRange: [0.75, 0],
      extrapolate: 'clamp'
    })

    return (
      <TouchableWithoutFeedback
        key="backdrop"
        onPressIn={() => this._flick.stop()}
        onPress={() => this._requestClose()}>
        <Animated.View style={[styles.backdrop, {opacity: backdropOpacity}]} />
      </TouchableWithoutFeedback>
    )
  }

  _renderContent() {
    const {top, bottom} = this.props.draggableRange
    const height = this.props.height

    const translateY = this._translateYAnimation.interpolate({
      inputRange: [-top, -bottom],
      outputRange: [-top, -bottom],
      extrapolate: 'clamp'
    })

    const transform = {transform: [{translateY}]}

    const animatedContainerStyles = [
      styles.animatedContainer,
      transform,
      {height, top: visibleHeight, bottom: 0}
    ]

    if (typeof this.props.children === 'function') {
      return (
        <Animated.View key="content" style={animatedContainerStyles}>
          {this.props.children(this._panResponder.panHandlers)}
        </Animated.View>
      )
    }

    return (
      <Animated.View
        key="content"
        style={animatedContainerStyles}
        {...this._panResponder.panHandlers}>
        {this.props.children}
      </Animated.View>
    )
  }

  render() {
    if (!this.props.visible) {
      return null
    }

    return [this._renderBackdrop(), this._renderContent()]
  }
}

export default SlidingUpPanel
