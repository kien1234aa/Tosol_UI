module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@gluestack-ui|nativewind|react-native-css-interop|@gluestack-ui/core|react-redux|@reduxjs/toolkit|redux|immer|reselect|redux-thunk)/)',
  ],
};
