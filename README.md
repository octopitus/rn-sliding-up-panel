# Sliding up panel [![npm](https://img.shields.io/npm/v/rn-sliding-up-panel.svg)](https://www.npmjs.com/package/rn-sliding-up-panel)

React Native draggable sliding up panel purly implemented in Javascript. Inspired by [AndroidSlidingUpPanel](https://github.com/umano/AndroidSlidingUpPanel). Works nicely on both iOS and Android.

<img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/sliding_panel_android.gif" height="460" style="display: inline-block" /><img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/bottom_sheet_demo.gif" height="460" style="display: inline-block" />

# Dependencies

  - React >= 16.
  - `rn-sliding-up-panel` was built with React Native version 0.47 but it may work with older versions since this is pure Javascript.

# Installation

    npm install --save rn-sliding-up-panel

or if you are using [yarn](http://yarnpkg.com)

    yarn add rn-sliding-up-panel

# Example

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
- [ScrollView insides the panel](demo/ScrollViewInsidePanel.js)
- [Bottom sheet](demo/BottomSheet.js)

# Props

|Property|Type|Description
|---|---|---
|draggableRange|{top: number, bottom: number}|Boundary limits for draggable area. `top` default to visible height of device, `bottom` default to 0.
animatedValue|Animated.Value|An **Animated.Value** number between the top and bottom of draggable range. This number represents the position of the panel. If you update this prop, the panel will correspondingly update to the frame at that progress value. Default to **Animated.Value(0)** (Hidden at bottom of screen).
|minimumVelocityThreshold|number| Velocity threshold in **pixel/s** to trigger the fling animation after you release finger. Default is 0.1.
|minimumDistanceThreshold|number| Distance threshold in **pixel** (virtual, not physical) to trigger the fling animation after you release finger. Default is 0.24.
|height|number|Height of panel. Default to visible height of device.
|friction|number|Determines how quickly the fling animation settles down and stops. The higher the value, the faster the velocity decreases. Default is 0.1.
|backdropOpacity|number|Opacity of the backdrop when the panel is active. Default is 0.75.
|showBackdrop|boolean|Controls the visibility of backdrop. Default `true`.
|allowMomentum|boolean|If `false`, panel will not continue to move when you release your finger.
|onDragStart|(position: number) => void|Called when the panel is about to start dragging.
|onDragEnd|(position: number) => void|Called when you release your finger.
|children|React.Element \| Function|Accepts passing a function as component. Invoked with `dragHandlers` (that can be passed into another View like this `<View {...dragHandlers}>`) when the panel is mounted. Useful when you want only a part of your content becomes the drag handler.

**Notes**:
- Except children, all other properties are optional.

# Methods

## show(value?: number | TimingAnimationConfig):

Programmatically move panel to a given value. Accepts a number or an object that may have the following options:

- **toValue**: The value that the panel will move to.
- **initialVelocity**: Initial velocity of the animation.

**Note:** Calling `show()` without any parameter will showmove the panel to top position (of draggableRange).

## hide():

Move the panel to the bottom position of draggable range. **Note:** This method is triggered if you touch the backdrop (If it's visible).

## scrollIntoView(node: number |  | Component | ComponentClass):

Ensure an element (node) is visible within the viewable area. Eg: An element is hidden under the keyboard. **Note:** The element must be a descendant node of the panel.
