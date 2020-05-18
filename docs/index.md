# Getting started

React Native draggable sliding up panel purly implemented in Javascript. Inspired by [AndroidSlidingUpPanel](https://github.com/umano/AndroidSlidingUpPanel). Works nicely on any platforms.

Demo: [Expo](https://expo.io/@octopitus/SlidingUpPanel) | [web](https://codesandbox.io/s/3440ox733m)

<img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/sliding_panel.gif" height="460" style="display: inline-block" /><img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/bottom_sheet.gif" height="460" style="display: inline-block" />

## Dependencies
  - React >= 16.
  - `rn-sliding-up-panel` is built with React Native 0.47 but it may work with older versions since this is pure Javascript.

## Installation
```bash
npm install --save rn-sliding-up-panel
```

or if you are using [yarn](http://yarnpkg.com):

```bash
yarn add rn-sliding-up-panel
```

## Example

```jsx
import React from 'react';
import {View, Button, Text} from 'react-native';

import SlidingUpPanel from 'rn-sliding-up-panel';

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  }
}

class MyComponent extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Button title='Show panel' onPress={() => this._panel.show()} />
        <SlidingUpPanel ref={c => this._panel = c}>
          <View style={styles.container}>
            <Text>Here is the content inside panel</Text>
            <Button title='Hide' onPress={() => this._panel.hide()} />
          </View>
        </SlidingUpPanel>
      </View>
    )
  }
}
```

**More:**

  - [ScrollView insides the panel](https://github.com/octopitus/rn-sliding-up-panel/blob/master/demo/ScrollViewInsidePanel.js)
  - [Bottom sheet](https://github.com/octopitus/rn-sliding-up-panel/blob/master/demo/BottomSheet.js)

## Props

|Property|Type|Description
|---|---|---
animatedValue|Animated.Value|An **Animated.Value** number between the top and bottom of draggable range. This number represents the position of the panel. If you update this prop, the panel will correspondingly update to the frame at that progress value. Default to **Animated.Value(0)** (Hidden at bottom of screen).
|draggableRange|{top: number, bottom: number}|Boundary limits for draggable area. `top` default to visible height of device, `bottom` default to 0.
|snappingPoints|number[]|Must be an incremental array of number and all values must be within the `top` & `bottom` of draggableRange.
|minimumVelocityThreshold|number| Velocity threshold in **pixel/s** to trigger the fling animation after you release finger. Default is 0.1.
|minimumDistanceThreshold|number| Distance threshold in **pixel** (virtual, not physical) to trigger the fling animation after you release finger. Default is 0.24.
|height|number|Height of panel. Typically this should equal to the top value of `draggablerange.`
|friction|number|Determines how quickly the fling animation settles down and stops. The higher the value, the faster the velocity decreases. Default is 0.998.
|backdropOpacity|number|Opacity of the backdrop when the panel is active. Default is 0.75.
|containerStyle|Style|Custom style for the container.
|backdropStyle|Style|Custom style for the backdrop.
|showBackdrop|boolean|Controls the visibility of backdrop. Default `true`.
|allowMomentum|boolean|If `false`, panel will not continue to move when you release your finger.
|allowDragging|boolean|Default `true`. Setting this to `false` to disable dragging.
|avoidKeyboard|boolean|If `true` every time animated value changes keyboard will be dismissed. Default `true`.
|onBackButtonPress|() => boolean|By default when you press back button (Android) the panel will be closed (Move to `bottom` position of `draggableRange`). Implement this function if you want to custom the behavior. Returning `true` means the event has been handled.
|onDragStart|(position: number, gestureState: GestureState) => void|Called when the panel is about to start dragging.
|onDragEnd|(position: number: gestureState: GestureState) => void|Called when you release your finger.
|onMomentumDragStart|(position: number) => void|Called when the momentum drag starts. Works exactly the same way of [ScrollView#onMomentumScrollBegin](https://facebook.github.io/react-native/docs/scrollview#onmomentumscrollbegin).
|onMomentumDragEnd|(position: number) => void|Called when the momentum drag ends. Works exactly the same way of [ScrollView#onMomentumScrollEnd](https://facebook.github.io/react-native/docs/scrollview#onmomentumscrollend).
|onBottomReached|() => void|Called when the panel is hidden / reaches the bottom of the screen.
|children|React.Element \| Function|Accepts passing a function as component. Invoked with `dragHandlers` (that can be passed into another View like this `<View {...dragHandlers}>`) when the panel is mounted. Useful when you want only a part of your content becomes the drag handler.

A `gestureState` (is forwarded from `PanResponder'`s callbacks) object has the following:

- `stateID` - ID of the gestureState - persisted as long as there at least one touch on screen
- `moveX` - the latest screen coordinates of the recently-moved touch
- `moveY` - the latest screen coordinates of the recently-moved touch
- `x0` - the screen coordinates of the responder grant
- `y0` - the screen coordinates of the responder grant
- `dx` - accumulated distance of the gesture since the touch started
- `dy` - accumulated distance of the gesture since the touch started
- `vx` - current velocity of the gesture
- `vy` - current velocity of the gesture
- `numberActiveTouches` - Number of touches currently on screen

**Notes**:
- Except children, all other properties are optional.
- Call `show()` or `hide()`  won't trigger `onMomentum*` events.
- If `snappingPoints` is set, the panel will always either snaps to top, bottom or a closest possible value of it.

## Methods

### show(value?: number | Object):

Programmatically move panel to a given value. Accepts a number or an object that may have the following options:

- **toValue**: The value that the panel will move to.
- **velocity**: Initial velocity of the animation.

**Note:** Calling `show()` without any parameter will showmove the panel to top position (of draggableRange).

### hide():

Move the panel to the bottom position of draggable range. **Note:** This method is triggered if you touch the backdrop (If it's visible).

### scrollIntoView(node: number):

Typically you don't need to use this method, But if an element is stuck under the keyboard or out of view, you can use this ensure it is visible within the viewable area.

**Note:**

- The element must be in the subtree of the panel component.
- Node can be obtained by using `findNodeHandle`.
