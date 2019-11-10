# Common sources of performance problems

## Running in development mode
Many people have noticed that performance of the panel reduced sinificantly if development mode (`dev=true`) is turned on. This is unavoidable because the entire animation is running on the Javascript thread. A lot more work needs to be done to provide you good warning and error messges.

So make sure you are not using Chrome debugger or devtool when testing animations. If you want to view your data while the panel is moving, there are [various ways](https://gist.github.com/brentvatne/7210bfbc9ad209fb49dd).

## Doing expensive operations while the panel is animating
Because the animation is in the Javascript thread, when you move the panel or fling it:

- Each frame during the transition, the JavaScript thread needs to send a new y-offset to the main thread. If the JavaScript thread is locked up, it cannot do this and so no update occurs on that frame and the animation stutters.

To avoid this, I recommend to use `InteractionManager` to schedule long-running works to start after the interaction/animation have completed.

```js
this.panel.show() // Or hide()

InteractionManager.runAfterInteractions(() => {
  // ...long-running synchronous task...
});
```

## Touchables or inputs are not very responsive
Sometimes if we do an action while the panel are moving, we won't see the effect of `onPress`, `onFocus`... immediately. If our action does a lot of work and results in a few frames dropped, this may occur. A workaround is to wrap the action in a `setTimeout` or `requestAnimationFrame`:

```js
handleOnPress() {
  setTimeout(() => {
    // Our action...
  })
}
```
