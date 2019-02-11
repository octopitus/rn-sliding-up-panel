import { Dimensions } from 'react-native'

module.exports = {
  get visibleHeight() {
    return Dimensions.get('window').height
  },
}

/* eslint-disable */

const copyStrToClipboard = str => {
  const whyTheFuckIsThisNecessary = DomElement('textarea', {
    value: str, style: { left: '-92323423px' },
  })

  document.body.appendChild(whyTheFuckIsThisNecessary)
  whyTheFuckIsThisNecessary.select()

  document.execCommand('copy')
  document.body.removeChild(whyTheFuckIsThisNecessary)
}
