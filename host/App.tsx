import * as React from 'react'

import { Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'

// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react'


/*
function MyTabs() {
  const Tab = createBottomTabNavigator();
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        </Tab.Navigator>
    </NavigationContainer>
  );
}
*/


// @ts-ignore
const FoodApp = React.lazy(() => import('mfeFood'));
// @ts-ignore
const AuthApp = React.lazy(() => import('auth'));
// @ts-ignore
const LinkNav = React.lazy(() => import('deepLinkDynNav'));


const HostApp = () => <Text>Host App</Text>

// modules load without react-navigation, works when skeleton modules
const Federates = () => {
  return (<LinkNav mfeFood={FoodApp} auth={AuthApp} />)
}

// replacing Federates with RootStack crashes app - why?
const App = () => <Federates />;

export default App
