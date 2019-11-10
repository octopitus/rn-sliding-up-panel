import {ReactElement, Component} from 'react'
import {
  Animated,
  StyleProp,
  ViewStyle,
  PanResponderGestureState,
  GestureResponderHandlers
} from 'react-native'

export interface SlidingUpPanelProps {
  height?: number
  animatedValue?: Animated.Value
  draggableRange?: {top: number; bottom: number}
  snappingPoints?: number[]
  minimumVelocityThreshold?: number
  minimumDistanceThreshold?: number
  avoidKeyboard?: boolean
  onBackButtonPress?: () => boolean
  onDragStart?: (value: number, gestureState: PanResponderGestureState) => void
  onDragEnd?: (value: number, gestureState: PanResponderGestureState) => void
  onMomentumDragStart?: (value: number) => void
  onMomentumDragEnd?: (value: number) => void
  onBottomReached?: () => any
  allowMomentum?: boolean
  allowDragging?: boolean
  showBackdrop?: boolean
  backdropOpacity?: number
  friction?: number
  containerStyle?: StyleProp<ViewStyle>
  backdropStyle?: StyleProp<ViewStyle>
  children?:
    | ReactElement
    | ((dragHandlers: GestureResponderHandlers) => ReactElement)
}

export interface SlidingUpPanelAnimationConfig {
  toValue: number
  velocity: number
}

export default class SlidingUpPanel extends Component<SlidingUpPanelProps> {
  show: (value?: number | SlidingUpPanelAnimationConfig) => void
  hide: () => void
  scrollIntoView: (node: number) => void
}
