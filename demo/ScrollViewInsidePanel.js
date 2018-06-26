/**
 * You MUST control the allowDragging prop manually.
 * In this example i simply use onTouchStart, onTouchCancel and onTouchEnd of ScrollView.
 * But in real world, you must enable allowDragging if the scrollable content is at top or bottom.
 */

import React from 'react'
import {
  AppRegistry,
  View,
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native'

import SlidingUpPanel from 'rn-sliding-up-panel'

const styles = {
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  }
}

class ScrollViewInsidePanel extends React.Component {
  state = {
    visible: false,
    allowDragging: true
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.setState({visible: true})}>
          <View>
            <Text>Show</Text>
          </View>
        </TouchableOpacity>
        <SlidingUpPanel
          ref={c => (this._panel = c)}
          visible={this.state.visible}
          allowDragging={this.state.allowDragging}
          onRequestClose={() => this.setState({visible: false})}>
          <View style={styles.container}>
            <TouchableOpacity onPress={() => this.setState({visible: false})}>
              <View>
                <Text>Hide</Text>
              </View>
            </TouchableOpacity>
            <ScrollView
              onTouchEnd={() => this.setState({allowDragging: true})}
              onTouchCancel={() => this.setState({allowDragging: true})}
              onTouchStart={() => this.setState({allowDragging: false})}>
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
        </SlidingUpPanel>
      </View>
    )
  }
}

AppRegistry.registerComponent('ScrollViewInsidePanel', () => ScrollViewInsidePanel)
