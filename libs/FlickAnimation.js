/* @flow */
import {Animated} from 'react-native'
import {visibleHeight} from './layout'

const MAX = 0
const MIN = -visibleHeight

const TIME_CONTANT: number = 325

type AnimationConfig = {
  velocity: number,
  fromValue: number,
  factor?: number
}

export default class FlickAnimation {
  _active: boolean

  _velocity: number
  _factor: number
  _startTime: number

  _toValue: number
  _animationFrame: any
  _animation: Animated.Value

  constructor(animation: Animated.Value) {
    this._animation = animation
  }

  _scroll(toValue: number): void {
    // eslint-disable-next-line no-nested-ternary
    const offset: number = (toValue > MAX) ? MAX : (toValue < MIN) ? MIN : toValue
    console.log(`offset ${offset}`)
    this._animation.setValue(offset)

    if (offset === MIN || offset === MAX) {
      this.stop()
    }
  }

  isActived(): boolean {
    return this._active
  }

  start(config: AnimationConfig): void {
    this._active = true
    this._velocity = -config.velocity * 16.67
    this._factor = config.factor != null ? config.factor : 0.8 // eslint-disable-line eqeqeq
    this._toValue = config.fromValue
    this._startTime = Date.now()
    this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this))
  }

  onUpdate(): void {
    if (!this._active) {
      return
    }

    const elapsedTime = Date.now() - this._startTime
    const amplitude = this._factor * this._velocity
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
