import * as React from 'react'

import { Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
// @ts-ignore
const FoodApp = React.lazy(() => import('mfeFood'));
// @ts-ignore
const AuthApp = React.lazy(() => import('auth'));
// @ts-ignore
const LinkNav = React.lazy(() => import('deepLinkDynNav'));

const DeepLinkDynNavFallback = () => {
  return <Text>Loading deep linking and dynamic navigation...</Text>
}

const HomeScreen = () => <Text>Home --- Screen</Text>

function HomeScreen2() {
  console.log('HS2!!') // can see if use lower versions of react-navigation
  return  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
      paddingBottom: 50,
    }}
  ><Text>Home Screen2 Works with R-Navigation</Text>
  </View>
}
const Stack = createNativeStackNavigator()


const Screens = () => <React.Fragment></React.Fragment>

function RootStack() {
  return (
  /*  <NavigationContainer>*/
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'My home' }}
        name="FoodApp"
        component={HomeScreen2}
      />
      <Stack.Screen name="AuthApp" component={HomeScreen2} />
    </Stack.Navigator>)
   /* </NavigationContainer>*/

}

// modules load without react-navigation, works when skeleton modules
const Federates = () => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingBottom: 50,
      }}
    >
      <React.Suspense fallback={<DeepLinkDynNavFallback />}>
        <AuthApp />
        <LinkNav/>
        <FoodApp />
      </React.Suspense>
    </View>
  )
}

// replacing Federates with RootStack crashes app - why?
const App = () => <Federates />

export default App
