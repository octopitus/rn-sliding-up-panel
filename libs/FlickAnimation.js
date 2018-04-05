import {PixelRatio} from 'react-native'
import clamp from 'clamp'

const density = PixelRatio.get()

const TIME_CONTANT = 325

export default class FlickAnimation {
  constructor(animation, min, max) {
    this.onUpdate = this.onUpdate.bind(this)

    this._animation = animation
    this._min = min
    this._max = max
  }

  _scroll(toValue) {
    const value = clamp(toValue, this._min, this._max)
    this._animation.setValue(value)

    if (value === this._min || value === this._max) {
      this.stop()
    }
  }

  start(config) {
    this._active = true
    this._amplitude = config.amplitude != null ? config.amplitude : 0.8
    this._velocity = -config.velocity * density * 10
    this._toValue = config.fromValue
    this._startTime = Date.now()
    this._animationFrame = requestAnimationFrame(this.onUpdate)
  }

  onUpdate() {
    if (!this._active) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const delta =
      -(this._amplitude * this._velocity) *
      Math.exp(-elapsedTime / TIME_CONTANT)

    if (Math.abs(delta) < 0.5) {
      return
    }

    this._toValue += delta
    this._scroll(this._toValue)
    this._animationFrame = requestAnimationFrame(this.onUpdate)
  }

  stop() {
    this._active = false
    this._animation.stopAnimation()
    cancelAnimationFrame(this._animationFrame)
  }
}
