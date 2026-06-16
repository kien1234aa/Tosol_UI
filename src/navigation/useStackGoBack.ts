import { useCallback } from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

/**
 * Pops the current stack screen, or navigates to a safe fallback when history
 * is empty (e.g. deep link / state restore).
 */
export function useStackGoBack<ParamList extends ParamListBase>(
  navigation: NavigationProp<ParamList>,
  fallbackScreen: keyof ParamList,
) {
  return useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(fallbackScreen as never);
  }, [navigation, fallbackScreen]);
}
