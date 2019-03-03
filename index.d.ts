import React from 'react'
import {
  Animated,
  GestureResponderHandlers,
  PanResponderGestureState
} from 'react-native'

interface Props {
  height?: number;
  animatedValue?: Animated.Value;
  draggableRange?: {top: number, bottom: number};
  minimumVelocityThreshold?: number;
  minimumDistanceThreshold?: number;
  avoidKeyboard?: boolean;
  onDragStart?: (value: number, gestureState: PanResponderGestureState) => void;
  onDragEnd?: (value: number, gestureState: PanResponderGestureState) => void;
  allowDragging?: boolean;
  allowMomentum?: boolean;
  backdropOpacity?: number;
  friction?: number;
  children:
    | JSX.Element
    | ((dragHandlers: GestureResponderHandlers) => JSX.Element);
}

declare class SlidingUpPanel<P extends Props> extends React.Component<P, {}> {
  public scrollIntoView(node: number | React.ComponentClass): void;
  public show(value?: number | {toValue: number, velocity: number}): void;
  public hide(): void;
}

export default SlidingUpPanel
