module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
        ],
        alias: {
          '@': './',
          '@app': './src/app',
          '@assets': './src/assets',
          '@config': './src/config',
          '@features': './src/features',
          '@locales': './src/locales',
          '@mappers': './src/mappers',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@shared': './src/shared',
          'tailwind.config': './tailwind.config.js',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};
