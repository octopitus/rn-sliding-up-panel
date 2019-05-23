import {ReactElement, Component} from 'react'
import {
  Animated,
  PanResponderGestureState,
  GestureResponderHandlers
} from 'react-native'

interface Props {
  height?: number
  animatedValue?: Animated.Value
  draggableRange?: {top: number; bottom: number}
  snappingPoints?: number[]
  minimumVelocityThreshold?: number
  minimumDistanceThreshold?: number
  avoidKeyboard?: boolean
  onBackButtonPress?: () => void
  onDragStart?: (value: number, gestureState: PanResponderGestureState) => void
  onDragEnd?: (value: number, gestureState: PanResponderGestureState) => void
  onMomentumDragStart?: (value: number) => void
  onMomentumDragEnd?: (value: number) => void
  allowMomentum?: boolean
  allowDragging?: boolean
  showBackdrop?: boolean
  backdropOpacity?: number
  friction?: number
  children?:
    | ReactElement
    | ((dragHandlers: GestureResponderHandlers) => ReactElement)
}

interface AnimationConfig {
  toValue: number
  velocity: number
}

export default class SlidingUpPanel extends Component<Props> {
  show: (value: number | AnimationConfig) => void
  hide: () => void
}
