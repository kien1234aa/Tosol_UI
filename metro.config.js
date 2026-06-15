const { getDefaultConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = ['react-native', 'require', 'browser'];

module.exports = withNativeWind(config, { input: './global.css' });
