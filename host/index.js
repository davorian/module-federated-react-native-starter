import { AppRegistry } from 'react-native'
import App from './App'
import { name as appName } from './app.json'
import { NavigationContainer } from '@react-navigation/native'
import * as React from 'react'

AppRegistry.registerComponent(appName, () => App)
