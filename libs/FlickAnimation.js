import {PixelRatio} from 'react-native'
import clamp from 'clamp'

import {DELTA_TIME} from './constants'

const density = PixelRatio.get()

export default class FlickAnimation {
  _listeners = []

  constructor(configs) {
    this._scrollTo = this._scrollTo.bind(this)
    this._updateValue = this._updateValue.bind(this)
    this.isStarted = this.isStarted.bind(this)
    this.setFriction = this.setFriction.bind(this)
    this.setMax = this.setMax.bind(this)
    this.setMin = this.setMin.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.onUpdate = this.onUpdate.bind(this)

    this._min = configs.min
    this._max = configs.max
    this._friction = clamp(configs.friction, 0, 1)
  }

  _scrollTo(toValue) {
    const value = clamp(toValue, this._min, this._max)
    this._listeners.forEach(listener => listener(value))

    if (value === this._min || value === this._max) {
      this.stop()
    }
  }

  _updateValue() {
    if (!this._isStarted) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const delta = -(this._velocity / this._friction) * Math.exp(-elapsedTime / DELTA_TIME) // prettier-ignore

    if (Math.abs(delta) < 0.5) {
      return
    }

    this._fromValue = this._fromValue + delta
    this._animationFrame = requestAnimationFrame(this._updateValue)
    this._scrollTo(this._fromValue)
  }

  isStarted() {
    return this._isStarted === true
  }

  setFriction(value) {
    this._friction = clamp(value, 0, 1)
  }

  setMax(value) {
    this._max = value
  }

  setMin(value) {
    this._min = value
  }

  start(config) {
    this._isStarted = true
    this._startTime = Date.now()
    this._fromValue = config.fromValue
    this._velocity = config.velocity * density * 10
    this._animationFrame = requestAnimationFrame(this._updateValue)
  }

  stop() {
    this._isStarted = false
    cancelAnimationFrame(this._animationFrame)
  }

  onUpdate(listener) {
    this._listeners.push(listener)
    return {
      remove: () => this._listeners.filter(l => l !== listener)
    }
  }
}
