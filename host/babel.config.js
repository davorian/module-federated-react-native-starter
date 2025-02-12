module.exports = {
  presets: ['module:@react-native/babel-preset'],
  comments: true,
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
      },
      'react-native-reanimated/plugin',
    ],
  ],
}
