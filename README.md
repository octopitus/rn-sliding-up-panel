# Sliding up panel [![npm](https://img.shields.io/npm/v/rn-sliding-up-panel.svg)](https://www.npmjs.com/package/rn-sliding-up-panel)

React Native draggable sliding up panel purly implemented in Javascript. Inspired by [AndroidSlidingUpPanel](https://github.com/umano/AndroidSlidingUpPanel). Works nicely on both iOS and Android.

<img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/sliding_panel_android.gif" height="460" style="display: inline-block" /><img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/bottom_sheet_demo.gif" height="460" style="display: inline-block" />

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
  state = {
    visible: false
  }

  render() {
    return (
      <View style={styles.container}>
        <Button title='Show panel' onPress={() => this.setState({visible: true})} />
        <SlidingUpPanel
          visible={this.state.visible}
          onRequestClose={() => this.setState({visible: false})}>
          <View style={styles.container}>
            <Text>Here is the content inside panel</Text>
            <Button title='Hide' onPress={() => this.setState({visible: false})} />
          </View>
        </SlidingUpPanel>
      </View>
    )
  }
}
```

# Props

|Property|Type|Description
|---|---|---
|visible|boolean|Deterimines whether the panel is visible.
|draggableRange|{top: number, bottom: number}|Boundary limits for draggable area. `top` default to visible height of device, `bottom` default to 0.
|height|number|Height of panel. Default to visible height of device.
|onRequestClose|Function|Called when you touch the backdrop or slide down to hide the panel.
|onDragStart|(position: number) => void|Called when the panel is about to start dragging.
|onDrag|(position: number) => void|Called when the panel is dragging. Fires at most once per frame.
|onDragEnd|(position: number) => void|Called when you release your finger.
|showBackdrop|boolean|Controls the visibility of backdrop. Default `true`.
|allowDragging|boolean|Default `true`. Setting this to `false` to disable dragging. Touching the backdrop triggers `onRequestClose` normally.
|allowMomentum|boolean|If `false`, panel will not continue to move when you release your finger.
|~~contentStyle~~|~~ViewStyle~~|~~The style of content inside panel.~~ **Deprecated**. You should wrap your content inside a View.
|children|React.Element \| Function|Accepts passing a function as component. Invoked with `dragHandlers` (that can be passed into another View like this `<View {...dragHandlers}>`) when the panel is mounted. Useful when you want a part of your content that allows the user to slide the panel with.

**Notes**:
- All properties are optional.

# Methods

## transitionTo: (value: number | TimingAnimationConfig)

Programmatically move panel to a given value. Accepts a number or an object that may have the following options:

- **toValue**: The value that the panel will move to.
- **duration**: Length of animation (milliseconds). Default is 260.
- **easing**: Easing function to define curve. Default is `Easing.inOut(Easing.ease)`.
- **onAnimationEnd**: A callback that will be called when the animation is done.

# Advanced Usage
> In progress.

# Changelogs
## 1.2.0
- Accept function as children. Allow a part of content becomes drag handlers.
- Fix issue can not interact with components underlies the panel.
