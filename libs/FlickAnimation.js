import { PixelRatio } from 'react-native'
import clamp from 'clamp'

const density = PixelRatio.get()

const TIME_CONTANT = 325

export default class FlickAnimation {
  constructor(animation, configs) {
    this.isActive = this.isActive.bind(this)
    this.setActive = this.setActive.bind(this)
    this.setMax = this.setMax.bind(this)
    this.setMin = this.setMin.bind(this)
    this.setDamping = this.setDamping.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this._scroll = this._scroll.bind(this)

    this._animation = animation
    this._min = configs.min
    this._max = configs.max
    this._damping = 1 - (configs.damping != null ? configs.damping : 0.26)
  }

  _scroll(toValue) {
    const value = clamp(toValue, this._min, this._max)
    this._animation.setValue(value)

    if (value === this._min || value === this._max) {
      this.stop()
    }
  }

  isActive() {
    return this._active === true
  }

  setActive(value) {
    this._active = value
  }

  setMax(value) {
    this._max = value
  }

  setMin(value) {
    this._min = value
  }

  setDamping(value) {
    this._damping = value
  }

  start(config) {
    this._active = true
    this._startTime = Date.now()
    this._toValue = config.fromValue
    this._velocity = -config.velocity * density * 10
    this._animationFrame = requestAnimationFrame(this.onUpdate)
  }

  onUpdate() {
    if (!this._active) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const delta = -(this._damping * this._velocity) * Math.exp(-elapsedTime / TIME_CONTANT) // prettier-ignore

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
