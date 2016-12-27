/* @flow */
import {Animated, PixelRatio} from 'react-native'
import {visibleHeight} from './layout'

const density = PixelRatio.get()

const MAX = 0
const MIN = -visibleHeight

const TIME_CONTANT: number = 325

type AnimationConfig = {
  velocity: number,
  fromValue: number,
  deceleration?: number
}

export default class FlickAnimation {
  _active: boolean

  _velocity: number
  _deceleration: number
  _startTime: number

  _toValue: number
  _animationFrame: any
  _animation: Animated.Value

  constructor(animation: Animated.Value) {
    this._animation = animation
  }

  _scroll(toValue: number): void {
    // eslint-disable-next-line no-nested-ternary
    const offset = (toValue > MAX) ? MAX : (toValue < MIN) ? MIN : toValue
    this._animation.setValue(offset)

    if (offset === MIN || offset === MAX) {
      this.stop()
    }
  }

  start(config: AnimationConfig): void {
    this._active = true
    // eslint-disable-next-line eqeqeq
    this._deceleration = config.deceleration != null ? config.deceleration : 0.998
    this._velocity = -config.velocity * density * 10
    this._toValue = config.fromValue
    this._startTime = Date.now()
    this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this))
  }

  onUpdate(): void {
    if (!this._active) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const amplitude = this._deceleration * this._velocity
    const delta = -amplitude * Math.exp(-elapsedTime / TIME_CONTANT)

    if (Math.abs(delta) < 0.5) {
      return
    }

    this._toValue += delta
    this._scroll(this._toValue)
    this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this))
  }

  stop(): void {
    this._active = false
    this._animation.stopAnimation()
    global.cancelAnimationFrame(this._animationFrame)
  }
}
