const { getDefaultConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Match native build dirs on both Windows (\) and POSIX (/).
 * Do not use metro exclusionList here — on Windows it converts `/` to `\`
 * while Metro normalizes watched paths to `/`, so ignores fail silently.
 */
const nativeBuildBlockList =
  /([/\\]\.cxx[/\\]|[/\\]android[/\\]build[/\\]|[/\\]ios[/\\]build[/\\]|[/\\]\.gradle[/\\]|\/__tests__\/)/;

const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = ['react-native', 'require', 'browser'];
config.resolver.blockList = nativeBuildBlockList;

const finalConfig = withNativeWind(config, { input: './global.css' });
finalConfig.resolver.blockList = nativeBuildBlockList;

module.exports = finalConfig;
