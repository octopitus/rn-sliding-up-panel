import React from 'react'
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Platform
} from 'react-native'
import PropTypes from 'prop-types';

import FlickAnimation from './libs/FlickAnimation'
import {visibleHeight} from './libs/layout'
import styles from './libs/styles'

const deprecated = (condition, message) => condition && console.warn(message)

class SlidingUpPanel extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    draggableRange: PropTypes.shape({
      top: PropTypes.number.isRequired,
      bottom: PropTypes.number.isRequired
    }),
    height: PropTypes.number,
    onDrag: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onRequestClose: PropTypes.func,
    allowMomentum: PropTypes.bool,
    allowDragging: PropTypes.bool,
    showBackdrop: PropTypes.bool,
    backdropColor: PropTypes.string,
    translateYInit: PropTypes.func,
    backdropOpacity: PropTypes.number
  };

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
    showBackdrop: true,
    backdropColor:"black",
    translateYInit:()=>{},
    backdropOpacity: 0.75
  };

  constructor(props) {
    super(props)

    this.state={
      height:visibleHeight
    }

    this._onDrag = this._onDrag.bind(this)
    this._requestClose = this._requestClose.bind(this)
    this._renderBackdrop = this._renderBackdrop.bind(this)
    this._isInsideDraggableRange = this._isInsideDraggableRange.bind(this)

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

    this._animatedValueY = -bottom
    this._translateYAnimation = new Animated.Value(this._animatedValueY)
    this.props.translateYInit(this._translateYAnimation)
    this._flick = new FlickAnimation(this._translateYAnimation, -top, -bottom)

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
      this.transitionTo(-this.props.draggableRange.top)
    }

    if(nextProps.draggableRange.top != this.props.draggableRange.top || nextProps.draggableRange.bottom != this.props.draggableRange.bottom) {
      // const {top, bottom} = nextProps.draggableRange
      // this._flick = new FlickAnimation(this._translateYAnimation, -top, -bottom)
    }
  }

  componentDidUpdate() {
    const {bottom} = this.props.draggableRange
    if (this._animatedValueY !== -bottom && !this.props.visible) {
      this._translateYAnimation.setValue(-bottom)
    }
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetPanResponder(evt, gestureState) {
    return (
      this.props.allowDragging &&
      this._isInsideDraggableRange(this._animatedValueY)
    )
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    return (
      this.props.allowDragging &&
      this._isInsideDraggableRange(this._animatedValueY) &&
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
    if (!this._isInsideDraggableRange(this._animatedValueY)) {
      return
    }

    this._translateYAnimation.setValue(gestureState.dy)
  }

  // Trigger when you release your finger
  _onPanResponderRelease(evt, gestureState) {
    if (!this._isInsideDraggableRange(this._animatedValueY)) {
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

  _isInsideDraggableRange(value) {
    return (
      value >= -this.props.draggableRange.top &&
      value <= -this.props.draggableRange.bottom
    )
  }

  _onDrag({value}) {
    if (this._isInsideDraggableRange(value)) {
      this._animatedValueY = value
      this.props.onDrag(value)
    }

    if (value >= -this.props.draggableRange.bottom) {
      this.props.onRequestClose()
      return
    }
  }

  transitionTo(value, onAnimationEnd = () => {}) {
    const animationConfig = {
      toValue: -Math.abs(value),
      duration: 260,
      // eslint-disable-next-line no-undefined
      delay: Platform.OS === 'android' ? 166.67 : undefined // to make it looks smooth on android
    }

    Animated.timing(
      this._translateYAnimation,
      animationConfig
    ).start(onAnimationEnd)
  }

  _requestClose() {
    const {bottom} = this.props.draggableRange
    if (this._animatedValueY === -bottom) {
      return this.props.onRequestClose()
    }

    return this.transitionTo(
      -this.props.draggableRange.bottom,
      () => this.props.onRequestClose()
    )
  }

  _renderBackdrop() {
    if (!this.props.showBackdrop) {
      return null
    }

    const {top, bottom} = this.props.draggableRange

    const backdropOpacity = this._translateYAnimation.interpolate({
      inputRange: [-top, -bottom],
      outputRange: [this.props.backdropOpacity, 0],
      extrapolate: 'clamp'
    })

    return (
      <TouchableWithoutFeedback
        onPressIn={() => this._flick.stop()}
        onPress={() => this._requestClose()}>
        <Animated.View pointerEvents={this.props.allowDragging?"none":"auto"} style={[styles.backdrop, {opacity: backdropOpacity, backgroundColor:this.props.backdropColor}]} />
      </TouchableWithoutFeedback>
    )
  }

  layoutUpdated=(event) => {
    var {x, y, width, height} = event.nativeEvent.layout;
    this.setState({height});
  }

  render() {
    if (!this.props.visible) {
      return null
    }

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
      this.props.contentStyle,
      transform,
      {height, top: this.state.height, bottom: 0}
    ]

    return (
      <View style={styles.container} pointerEvents='box-none' onLayout={this.layoutUpdated}>
        {this._renderBackdrop()}
        <Animated.View {...this._panResponder.panHandlers} style={animatedContainerStyles}>
          {this.props.children}
        </Animated.View>
      </View>
    )
  }
}

export default SlidingUpPanel
