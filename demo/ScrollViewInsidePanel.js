import React from 'react'
import {View, TouchableOpacity, Text, ScrollView} from 'react-native'

import SlidingUpPanel from 'rn-sliding-up-panel'

const styles = {
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dragHandler: {
    alignSelf: 'stretch',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc'
  }
}

class ScrollViewInsidePanel extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this._panel.show()}>
          <View>
            <Text>Show</Text>
          </View>
        </TouchableOpacity>
        <SlidingUpPanel ref={c => (this._panel = c)}>
          {dragHandler => (
            <View style={styles.container}>
              <View style={styles.dragHandler} {...dragHandler}>
                <Text>Drag handler</Text>
              </View>
              <ScrollView>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
                <Text>Here is the content inside panel</Text>
              </ScrollView>
            </View>
          )}
        </SlidingUpPanel>
      </View>
    )
  }
}

export default ScrollViewInsidePanel
