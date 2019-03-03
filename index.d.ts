import {ComponentClass} from 'react'
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

interface SlidingUpPanel extends ComponentClass<Props> {
  scrollIntoView(node: number | Component | ComponentClass): void;
  show(value?: number | {toValue: number, velocity: number}): void;
  hide(): void;
}

export default SlidingUpPanel
