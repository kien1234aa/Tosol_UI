import React, { memo, useCallback } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { ordersCopy } from '@/src/configs/orders';
import { lightTokens } from '@/src/configs/theme';
import { Pressable } from '@/src/uikits/pressable';

interface OrdersSearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

function OrdersSearchBarComponent({ value, onChange }: OrdersSearchBarProps) {
  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search color={lightTokens.typography500} size={18} />

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={ordersCopy.searchPlaceholder}
          placeholderTextColor={lightTokens.typography500}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
          style={styles.input}
        />

        {value.length > 0 ? (
          <Pressable
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel={ordersCopy.searchClearA11y}
            hitSlop={8}
            style={styles.clearButton}>
            <X color={lightTokens.typography500} size={16} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const SEARCH_BAR_HEIGHT = 48;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: lightTokens.background50,
  },
  searchBar: {
    height: SEARCH_BAR_HEIGHT,
    borderRadius: SEARCH_BAR_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary200,
    backgroundColor: lightTokens.background0,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 15,
    color: lightTokens.typography900,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const OrdersSearchBar = memo(OrdersSearchBarComponent);
