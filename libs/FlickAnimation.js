import {PixelRatio} from 'react-native'
import {visibleHeight} from './layout'

const density = PixelRatio.get()

const MAX = 0
const MIN = -visibleHeight

const TIME_CONTANT = 325

export default class FlickAnimation {

  constructor(animation) {
    this._animation = animation
  }

  _scroll(toValue) {
    // eslint-disable-next-line no-nested-ternary
    const offset = (toValue > MAX) ? MAX : (toValue < MIN) ? MIN : toValue
    this._animation.setValue(offset)

    if (offset === MIN || offset === MAX) {
      this.stop()
    }
  }

  start(config) {
    this._active = true
    // eslint-disable-next-line eqeqeq
    this._amplitude = config.amplitude != null ? config.amplitude : 0.8
    this._velocity = -config.velocity * density * 10
    this._toValue = config.fromValue
    this._startTime = Date.now()
    this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this))
  }

  onUpdate() {
    if (!this._active) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const delta = -(this._amplitude * this._velocity) * Math.exp(-elapsedTime / TIME_CONTANT)

    if (Math.abs(delta) < 0.5) {
      return
    }

    this._toValue += delta
    this._scroll(this._toValue)
    this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this))
  }

  stop() {
    this._active = false
    this._animation.stopAnimation()
    global.cancelAnimationFrame(this._animationFrame)
  }
}
