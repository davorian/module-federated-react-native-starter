import {AppRegistry} from 'react-native';
import App from './src/app/App';
import appConfig from './app.json'; // Import the entire JSON object

AppRegistry.registerComponent(appConfig.name, function() { // Access the 'name' property
  return App;
});
