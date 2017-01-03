React Native draggable sliding up panel purly implemented in Javascript. Works nicely on both iOS and Android.

----------
<img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/sliding_panel_android.gif" height="480" />
<img src="https://raw.githubusercontent.com/octopitus/rn-sliding-up-panel/master/demo/sliding_panel_ios.gif" height="480" />

# Installation

    npm install --save rn-sliding-up-panel

or if you are using [yarn](http://yarnpkg.com)

    yarn add rn-sliding-up-panel

# Usage

```js
import React from 'react'
import {View, Text} from 'react-native'

import SlidingUpPanel from 'rn-sliding-up-panel'

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
        <SlidingUpPanel ref={c => this._panel = c} contentContainerStyle={styles.container}>
          <Text>Here is the content inside the panel</Text>
        </SlidingUpPanel>
        <TouchableOpacity onPress={() => this._panel.show()}>
          <Text>Show panel</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
```

# Props

|Property|Type|Description|
|---|---|---|
|height|number|Height of the panel. Default is the height window minus the height of status bar. **Note:** If you enabled the translucency of status bar, you must set this property to the height of window (`Dimensions.get('window').height`)
|initialPosition|number|Initial position of the panel. Default is the height of panel.
|disableDragging|boolean|Set to `true` to disable dragging. You must touch outside the panel or press back button (Android) to hide.
|onDrag|Function|Called when your panel is dragging. Fires at most once per frame.
|onShow|Function|Called once the panel has been shown.
|onHide|Function|Called once the panel has been completely hidden.
|contentContainerStyle|any|The style of the content container (View)

# Methods

## show: (config?: Object) => void

## hide: (config?: Object) => void

Programmatically show / hide the panel. Config accepts `duration`, `delay`, `easing` (Likes [Animated.timing](http://facebook.github.io/react-native/releases/0.39/docs/animated.html#timing))
