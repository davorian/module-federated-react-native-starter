import { AppRegistry } from 'react-native'
import App from './App';
import appConfig from './app.json'; // Import the entire JSON object

AppRegistry.registerComponent(appConfig.name, function() { // Access the 'name' property
  return App;
});
