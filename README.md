# Sliding up panel [![npm](https://img.shields.io/npm/v/rn-sliding-up-panel.svg)](https://www.npmjs.com/package/rn-sliding-up-panel)

React Native draggable sliding up panel purly implemented in Javascript. Inspired by [AndroidSlidingUpPanel](https://github.com/umano/AndroidSlidingUpPanel). Works nicely on both iOS and Android.

<img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/sliding_panel_android.gif" height="460" />
<img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/bottom_sheet_demo.gif" height="460" />

# Installation

    npm install --save rn-sliding-up-panel

or if you are using [yarn](http://yarnpkg.com)

    yarn add rn-sliding-up-panel

# Usage

```js
import React from 'react';
import {View, Button, Text, TouchableOpacity} from 'react-native';

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
        <TouchableOpacity onPress={() => this.setState({visible: true})}>
          <Text>Show panel</Text>
        </TouchableOpacity>
        <SlidingUpPanel
          ref={c => this._panel = c}
          visible={this.state.visible}
          onRequestClose={() => this.setState({visible: false})}>
          <View style={styles.container}>
            <Text>Here is the content inside panel</Text>
            <Button title='hide' onPress={() => this._panel.transitionTo(0)} />
          </View>
        </SlidingUpPanel>
      </View>
    )
  }
}
```

# Props

|Property|Type|Description|
|---|---|---|
|visible|boolean|Controls how panel should visible or not.
|draggableRange|{top: number, bottom: number}|You can not drag panel out of this range. `top` default to visible height of device, `bottom` default to 0.
|height|number|Control the height of panel. Default to height of window.
|onDragStart|Function|Called when panel is about to start dragging.
|onDrag|Function|Called when panel is dragging. Fires at most once per frame.
|onDragEnd|Function|Called when you release your fingers. Return `true` to cancel the momentum event (use this to use `transitionTo` inside the onDragEnd function).
|showBackdrop|boolean|Set to `false` to hide the backdrop behide panel. Default `true`.
|allowDragging|boolean|Set to `false` to disable dragging. Touch outside panel or press back button (Android) to hide. Default `true`.
|allowMomentum|boolean|If `false`, panel will not continue to move when you release your fingers. Default `true`.
|~~contentStyle~~|~~ViewStyle~~|~~The style of content inside panel.~~ Deprecated. You should wrap your content inside a View.

# Methods

## transitionTo: (value: number, onComplete: Function)

Programmatically move panel to a given value.
