// In App.js in a new project

import * as React from 'react'
import { Text, View } from 'react-native'

 import { NavigationContainer } from '@react-navigation/native'
// import { createNativeStackNavigator } from '@react-navigation/native-stack'
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator()

const Profile =  () => (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text> - Profile 👤- Deep Link Dyn Nav - </Text>
  </View>)


const Layout =  (Child:()=>React.JSX.Element) => () => (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  <Child/>
</View>)


function RootTabs({mfeFood, auth}:{mfeFood:()=>React.JSX.Element, auth: ()=>React.JSX.Element}) {
  return (
    <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Auth" component={Layout(auth)} />
      <Tab.Screen name="Food" component={Layout(mfeFood)} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
    </NavigationContainer>
  );
}
function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>- HomeScreen 🏠 - Deep Link Dyn Nav App -</Text>

    </View>
  )
}

/*const DeepLinkDynNavFallback = () => {
  return <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
      paddingBottom: 50,
    }}
  >
    <Text>Loading deep linking and dynamic navigation...</Text>
  </View>
}*/




/*function RootStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>)

}*/
// replacing HomeScreen with RootStack crashes app - why?
const App = ({mfeFood, auth}:{mfeFood:()=>React.JSX.Element, auth: ()=>React.JSX.Element})  => <RootTabs mfeFood={mfeFood} auth={auth}/>
// const App = () => <HomeScreen/>


export default App
