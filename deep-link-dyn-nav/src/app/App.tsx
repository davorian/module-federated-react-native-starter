// In App.js in a new project

import * as React from 'react'
import { View, Text } from 'react-native'

 import { NavigationContainer } from '@react-navigation/native'
 import { createNativeStackNavigator } from '@react-navigation/native-stack'

function HomeScreen() {
  console.log('HomeScreen Navigator')
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>---Deep Link Dyn Nav----</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator()

function RootStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
// replacing HomeScreen with RootStack crashes app - why?
const App = () => <HomeScreen />

export default App
