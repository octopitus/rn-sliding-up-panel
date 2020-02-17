# Determine the position of panel

The panel provides a various ways to get its position during the transition or when it's stopped. You can use `onDrag*` or `onMomentum*` events to listen to the animated value. Those events also provide you the gesture state.

```jsx
<SlidingUpPanel
  onDragStart={(value, gestureState) => {}}
  onDragEnd={(value, gestureState) => {}}
  onMomentumDragStart={(value, gestureState) => {}}
  onMomentumDragEnd={(value, gestureState) => {}}
  // Other props...
/>
```

On the other hand, can add listener directly to the animated value or using `InteractionManager` to determine animated value when the animation has stopped. This gives you more control and flexibility.

```jsx
import {InteractionManager, Animated} from 'react-native'
import SlidingUpPanel from 'rn-sliding-up-panel'

class BottomSheet extends Component {
  currentAnimatedValue = 0
  animatedValue = new Animated.Value(0)

  componentDidMount() {
    this.listener = this.animatedValue.addListener(this.onAnimatedValueChange)
  }

  componentWillUnmount() {
    this.animatedValue.removeListener(this.listener)
  }

  onAnimatedValueChange({value}) {
    // Fired when the panel is moving
  }

  show() {
    this.panel.show()

    InteractionManager.runAfterInteractions(() => {
      // Here the `currentAnimatedValue` will be equal to the bottom value of draggbleRange
    })
  }

  hide() {
    this.panel.hide()

    InteractionManager.runAfterInteractions(() => {
      // Here the `currentAnimatedValue` will be equal to the top value of draggbleRange
    })
  }

  render() {
    return (
      <SlidingUpPanel
        ref={c => (this.panel = c)}
        animatedValue={this.animatedValue}
        // Other props...
      />
    )
  }
}
```
