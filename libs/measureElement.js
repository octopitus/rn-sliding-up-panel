// @flow
import type { Element } from 'react'
import { findNodeHandle, UIManager } from 'react-native'

export type ElementLayout = {
  x: number,
  y: number,
  width: number,
  height: number,
}

const measureElement = (element: Element<*>): Promise<ElementLayout> => {
  const node = findNodeHandle(element)
  return new Promise((resolve: ElementLayout => void) => {
    UIManager.measureInWindow(
      node,
      (x: number, y: number, width: number, height: number) => {
        resolve({ x, y, width, height })
      }
    )
  })
}

export default measureElement
