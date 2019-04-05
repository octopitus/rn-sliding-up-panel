import {PixelRatio} from 'react-native'
import clamp from 'clamp'

import {TIME_CONSTANT} from './constants'

const density = PixelRatio.get()
const emptyFunc = () => {}

export default class FlickAnimation {
  _listeners = []

  constructor(configs) {
    this._min = configs.min
    this._max = configs.max
    this._onMomentumEnd = emptyFunc
    this._onUpdateListener = emptyFunc
  }

  _updateValue() {
    if (!this._active) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const delta = -(this._velocity / this._friction) * Math.exp(-elapsedTime / TIME_CONSTANT) // prettier-ignore

    if (Math.abs(delta) < 0.5) {
      this.stop()
      return
    }

    this._fromValue = clamp(this._fromValue + delta, this._min, this._max)
    this._onUpdateListener(this._fromValue)

    if (this._fromValue === this._min || this._fromValue === this._max) {
      this.stop()
      return
    }

    this._animationFrame = requestAnimationFrame(this._updateValue.bind(this))
  }

  setMax(value) {
    this._max = value
  }

  setMin(value) {
    this._min = value
  }

  start(configs) {
    this._active = true
    this._startTime = Date.now()
    this._fromValue = configs.fromValue
    this._friction = clamp(configs.friction, 0, 1)
    this._velocity = configs.velocity * density * 10
    this._onMomentumEnd = configs.onMomentumEnd || emptyFunc
    this._animationFrame = requestAnimationFrame(this._updateValue.bind(this))
  }

  stop() {
    if (this._active) {
      this._active = false
      this._onMomentumEnd(this._fromValue)
    }

    cancelAnimationFrame(this._animationFrame)
  }

  onUpdate(listener) {
    this._onUpdateListener = listener

    return {
      remove: () => (this._onUpdateListener = null)
    }
  }
}
