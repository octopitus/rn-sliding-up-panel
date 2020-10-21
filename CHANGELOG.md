# Changelogs

## 2.4.4
- Use currentlyFocusInput instead of currentlyFocusedField

## 2.4.3
- Fix issue pan handler is not being correctly released.

## 2.4.2
- Fix issue focusing on inputs outside panel causes the panel to show up.

## 2.4.1
- Fix issue `avoidKeyboard` doesn't have effect.

## 2.4.0

- Add `onBottomReached` prop.
- Prevents further propagation when `onBackButtonPress` returns true.

## 2.3.3

- Fix issue ScrollView is used accidentally.

## 2.3.2

- Fix issue `onDragEnd` doesn't always fire.

## 2.3.1

- Fix issue `onDragStart` is not called.

## 2.3.0

- Allow to custom backdrop & container styles

## 2.2.3

- Fix issue wrong position of the panel when it's stopped in the middle of animation.

## 2.2.2

- Fix issue can not use horizontal scrollable view (ScrollView, FlatList, SectionList) inside panel.

## 2.2.1

- Switch exports to ES6 for webpack compatibility.
- Fix issue of using touchable inside panel.

## 2.2.0

- Implement snapping points.
- Implement `onMomentumDrag*` events.
- Add Typescript definations.
- Fix issue call `show()` or `hide()` don't slide to proper position.
- Move `.babelrc` to `babel.config.js`.

## 2.1.1

- Fix issue with the position of panel on some Android devices (Devices without bottom navigation bar).

## 2.1

- Handle Android back button behavior.

## 2.0.2

- Replace eslint configs with `eslint-config-airbnb`.

## 2.0.1

- Upgrade dependencies to fix the vulnerability of lodash.

## 2.0.0

### Breaking changes:

- Remove the `visible` and `onRequestClose` props. The component now will always be rendered, below the screen. Use `show()` & `hide()` to control panel position.

### New features:

- Animated value is now configurable. Means you can control how the panel appears & disappears with Animated.timing, Animated.spring, Animated.decay.
- Expose more props to enhance effects (Initial velocity, friction, minimum velocity & distance threshold, etc...).
- Support screen orientation.
- Compatible with `react-native-web` ([Demo](https://codesandbox.io/s/3440ox733m))

### Issues fixed:

- The component now will automatically reacts to the keyboard events. Fixed several issues: #53, #32, #67.
- `onDragEnd` should be fired when the pan responder is terminated: #82
- Fix issue `height` property can not be changed: #74

## 1.2.1

- Add `startCollapsed`: Initially start the panel at bottom of draggable range.

## 1.2.0

- Accept function as children. Allow a part of content becomes drag handlers.
- Fix issue can not interact with components underlies the panel.
