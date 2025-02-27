import * as React from 'react'

import { Text, View } from 'react-native'

// @ts-ignore
const FoodApp = React.lazy(() => import('mfeFood'));
// @ts-ignore
const AuthApp = React.lazy(() => import('auth/App'));
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
