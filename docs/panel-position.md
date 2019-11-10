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

On the other hand, can add listener directly to the animated value. This gives you more control and flexibility.


```jsx
import {Animated} from 'react-native'
import SlidingUpPanel from 'rn-sliding-up-panel'

class BottomSheet extends Component {
  animatedValue = new Animated.Value(0) //

  componentDidMount() {
    this.listener = this.animatedValue.addListener(this.onAnimatedValueChange)
  }

  componentWillUnmount() {
    this.animatedValue.removeListener(this.listener)
  }

  onAnimatedValueChange({ value }) {
    // Fired when the panel is moving
  }

  render() {
    return (
      <SlidingUpPanel
        animatedValue={this.animatedValue}
        // Other props...
      />
    )
  }
}
```
