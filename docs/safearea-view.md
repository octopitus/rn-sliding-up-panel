# Using with SafeAreaView

I suggest to use the [react-native-safe-area-view](https://github.com/react-native-community/react-native-safe-area-view) because the build-in SafeAreaView component of React Native is only applicable to iOS devices with iOS version 11 or later.

## Example
```jsx
import SafeAreaView from 'react-native-safe-area-view'
import SlidingUpPanel from 'rn-sliding-up-panel'

// Your render function
<SlidingUpPanel>
  <SafeAreaView>
  // Content...
  </SafeAreaView>
</SlidingUpPanel>
```

## Caculate the draggable range
If you need the panel stays inside the safe area, not just the content, you have to calculate draggable range of the panel, minus the top & bottom.

```jsx
import { getInset } from 'react-native-safe-area-view';
import SlidingUpPanel from 'rn-sliding-up-panel'

const { width, height } = Dimensions.get('window');

const landScape = width > height;
const topPadding = getInset('top', landScape);
const bottomPadding = getInset('bottom', landScape);

<SlidingUpPanel
  draggableRange={{
    top: height - topPadding - bottomPadding,
    bottom: 0
  }}>
  // Your content...
</SlidingUpPanel>
```
