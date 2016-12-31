/**
 * @flow
 */
import React from 'react';
import {Modal, View, TouchableWithoutFeedback, Animated, PanResponder} from 'react-native';

import {visibleHeight} from './libs/layout';
import FlickAnimation from './libs/FlickAnimation';
import styles from './libs/styles';

const VMAX = 1.67;

type Props = {
  onPanelMove: (value: number) => void,
  contentContainerStyle: Object,
  children?: any
}

class SlidingUpPanel extends React.Component {

  static defaultProps: Props;
  props: Props;

  state: {visible: boolean};

  _panResponder: any;
  _animatedValueY: number;
  _translateYAnimation: Animated.Value;
  _flick: FlickAnimation;

  constructor(props: Props) {
    super(props);

    this.state = {visible: false};

    this._animatedValueY = 0;
    this._translateYAnimation = new Animated.Value(0);
    this._flick = new FlickAnimation(this._translateYAnimation);
  }

  componentWillMount() {
    this._translateYAnimation.addListener(this._onPanelMove);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._onStartShouldSetPanResponder.bind(this),
      onStartShouldSetResponderCapture: this._onStartShouldSetResponderCapture.bind(this),
      onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponderCapture: this._onMoveShouldSetPanResponderCapture.bind(this),
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this),
      onPanResponderTerminationRequest: () => true
    });
  }

  componentWillUnmount() {
    this._translateYAnimation.removeListener(this._onPanelMove);
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetPanResponder(evt, gestureState) {
    this._flick.stop();
    return true;
  }

  // eslint-disable-next-line no-unused-vars
  _onStartShouldSetResponderCapture(evt, gestureState) {
    return true;
  }

  _onMoveShouldSetPanResponder(evt, gestureState) {
    this._flick.stop();

    if (this._animatedValueY <= -visibleHeight) {
      return gestureState.dy > 1;
    }

    return Math.abs(gestureState.dy) > 1;
  }

  // eslint-disable-next-line no-unused-vars
  _onMoveShouldSetPanResponderCapture(evt, gestureState) {
    return true;
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderGrant(evt, gestureState) {
    this._translateYAnimation.setOffset(this._animatedValueY);
    this._translateYAnimation.setValue(0);
  }

  _onPanResponderMove(evt, gestureState) {
    if (
      this._animatedValueY + gestureState.dy <= -visibleHeight
    ) {
      return;
    }

    this._translateYAnimation.setValue(gestureState.dy);
  }

  _onPanResponderRelease(evt, gestureState) {
    if (
      this._animatedValueY <= -visibleHeight &&
      gestureState.dy <= 0
    ) {
      return;
    }

    this._translateYAnimation.flattenOffset();

    const velocity = gestureState.vy;

    if (this._animatedValueY >= -visibleHeight / 2) {
      this.hide();
      return;
    }

    // Predict if the panel closes in 20 frames
    const _delta = 325 * velocity;
    const _nextValueY = this._animatedValueY + _delta;

    if (velocity >= VMAX || (_nextValueY >= -visibleHeight / 2 && gestureState.vy > 0)) {
      this.hide();
      return;
    }

    if (Math.abs(gestureState.vy) > 0.1) {
      this._flick.start({velocity, fromValue: this._animatedValueY});
    }

    return;
  }

  // eslint-disable-next-line no-unused-vars
  _onPanResponderTerminate(evt, gestureState) {
    //
  }

  _onPanelMove = ({value}: {value: number}): void => {
    this._animatedValueY = value;
    this.props.onPanelMove(value);
    if (this._animatedValueY >= 0 && this.state.visible) {
      this.hide();
    }
  }

  _startShowAnimation = (): void => {
    const animationConfig = {
      duration: 220,
      toValue: -visibleHeight / 2
    };

    // just for smooth transition on dev mode
    if (__DEV__) {
      animationConfig.delay = 110;
    }

    Animated.timing(
      this._translateYAnimation,
      animationConfig
    ).start();
  }

  render(): ?React.Element<any> {
    const translateY = this._translateYAnimation;

    const backdropOpacity = this._translateYAnimation.interpolate({
      inputRange: [-visibleHeight, 0],
      outputRange: [0.75, 0]
    });

    const transform = {transform: [{translateY}]};

    const contentContainerStyle = this.props.contentContainerStyle;

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
            style={[styles.contentContainer, contentContainerStyle, transform]}>
            {this.props.children}
          </Animated.View>
        </View>
      </Modal>
    );
  }

  show = (): void => {
    this.setState({visible: true});
  }

  hide = (): void => {
    this._translateYAnimation.setOffset(0);

    const animation = Animated.timing(
      this._translateYAnimation,
      {duration: 220, toValue: 0}
    );

    animation.start(() => this.setState({visible: false}));
  }
}

SlidingUpPanel.defaultProps = {
  onPanelMove: () => {},
  contentContainerStyle: {}
};

export default SlidingUpPanel;
