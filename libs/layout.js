var {Dimensions} = require('react-native')

var layout = {
  get visibleHeight() {
    return Dimensions.get('window').height
  }
}

module.exports = layout
