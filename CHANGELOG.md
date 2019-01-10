# Changelogs
## 2.0.0-rc1
- Remove `visible`, `onRequestClose` and `onDrag` props and introduce `animatedValue` (Animated.Value) propperty. This value reflects the position of the panel. Now to control panel position, you can:
  - Get component's [ref](https://reactjs.org/docs/refs-and-the-dom.html) and call `show()` & `hide()` methods.
  - Change the value of `animatedValue` prop using [Animated APIs](https://facebook.github.io/react-native/docs/animated#methods).
- Expose `friction`, `minimumVelocityThreshold` and `minimumDistanceThreshold` properties.
- Automatically react to keyboard events.
- Support screen rotation.

## 1.2.1
- Add `startCollapsed`: Initially start the panel at bottom of draggable range.

## 1.2.0
- Accept function as children. Allow a part of content becomes drag handlers.
- Fix issue can not interact with components underlies the panel.
