import {findNodeHandle, UIManager} from 'react-native'

const measureElement = element => {
  const node = findNodeHandle(element)
  return new Promise(resolve => {
    UIManager.measureInWindow(node, (x, y, width, height) => {
      resolve({x, y, width, height})
    })
  })
}

export default measureElement
