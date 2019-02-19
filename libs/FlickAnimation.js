import { PixelRatio } from 'react-native'
import clamp from 'clamp'

const density = PixelRatio.get()

export default class FlickAnimation {
  _listeners = []

  constructor(configs) {
    this._scrollTo = this._scrollTo.bind(this)
    this._updateValue = this._updateValue.bind(this)
    this.isActive = this.isActive.bind(this)
    this.setActive = this.setActive.bind(this)
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
    if (!this._active) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const delta = -(this._velocity / this._friction) * Math.exp(-elapsedTime / 360) // prettier-ignore

    if (Math.abs(delta) < 0.5) {
      return
    }

    this._toValue = this._toValue + delta
    this._animationFrame = requestAnimationFrame(this._updateValue)
    this._scrollTo(this._toValue)
  }

  isActive() {
    return this._active === true
  }

  setActive(value) {
    this._active = value
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
    this._active = true
    this._startTime = Date.now()
    this._toValue = config.fromValue
    this._velocity = config.velocity * density * 10
    this._animationFrame = requestAnimationFrame(this._updateValue)
  }

  stop() {
    this._active = false
    cancelAnimationFrame(this._animationFrame)
  }

  onUpdate(listener) {
    this._listeners.push(listener)
    return () => this._listeners.filter(l => l !== listener)
  }
}
