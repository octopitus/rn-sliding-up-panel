import {InteractionManager, PixelRatio} from 'react-native'
import clamp from 'clamp'

import {TIME_CONSTANT, DELTA_THRESHOLD} from './constants'

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
    let delta = -(this._velocity / this._friction) * Math.exp(-elapsedTime / TIME_CONSTANT) // prettier-ignore

    // If delta is smaller than a threshold value,
    // and the panel is about to stop without any anchor point
    if (this._toValue == null && Math.abs(delta) < DELTA_THRESHOLD) {
      this.stop()
      return
    }

    const isMovingDown = delta < 0

    // Otherwise, ensure delta is alway greater than threshold value
    if (this._toValue != null) {
      delta = isMovingDown
        ? Math.min(delta, -DELTA_THRESHOLD)
        : Math.max(delta, DELTA_THRESHOLD)
    }

    const min = !isMovingDown ? this._min : this._toValue != null ? this._toValue : this._min // prettier-ignore
    const max = isMovingDown ? this._max : this._toValue != null ? this._toValue : this._max // prettier-ignore

    this._fromValue = clamp(this._fromValue + delta, min, max)
    this._onUpdateListener(this._fromValue)

    if (
      this._fromValue === this._toValue ||
      this._fromValue === this._min ||
      this._fromValue === this._max
    ) {
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
    this._toValue = configs.toValue
    this._fromValue = configs.fromValue
    this._friction = clamp(configs.friction, 0, 1)
    this._velocity = configs.velocity * density * 10
    this._onMomentumEnd = configs.onMomentumEnd || emptyFunc
    this._animationFrame = requestAnimationFrame(this._updateValue.bind(this))
    this._interactionHandler = InteractionManager.createInteractionHandle()
  }

  stop() {
    if (this._active) {
      this._active = false
      this._onMomentumEnd(this._fromValue)
    }

    if (this._interactionHandler) {
      InteractionManager.clearInteractionHandle(this._interactionHandler)
    }

    cancelAnimationFrame(this._animationFrame)
  }

  onUpdate(listener) {
    this._onUpdateListener = listener

    return {
      remove: () => {
        this._onUpdateListener = emptyFunc
        this.stop()
      }
    }
  }

  predictNextPosition({fromValue, velocity, friction}) {
    const v = velocity * density * 10

    const nextValue = Array.from({length: 60}).reduce((result, _, i) => {
      const delta = -(v / friction) * Math.exp(-(16.67 * i) / TIME_CONSTANT) // prettier-ignore
      return result + delta
    }, fromValue)

    return clamp(nextValue, this._min, this._max)
  }
}
