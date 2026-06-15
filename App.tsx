/**
 * @format
 */

import './global.css';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { RootNavigator } from '@/src/navigation';
import { store } from '@/src/store';
import { lightColors } from '@/src/core/theme';

function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <GluestackUIProvider mode="light">
            <StatusBar
              barStyle="dark-content"
              backgroundColor={lightColors.background0}
            />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </GluestackUIProvider>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = { flex: { flex: 1 } } as const;

export default App;
