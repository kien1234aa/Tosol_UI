import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { customerSearchMinLength } from '@/src/configs/api';
import { ordersCopy } from '@/src/configs/orders';
import { lightTokens } from '@/src/configs/theme';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import type { CustomerSearchResult } from '@/src/types/orders/createOrder.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface OrdersCustomerSearchBarProps {
  query: string;
  selectedCustomerName: string | null;
  results: CustomerSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  onChangeQuery: (value: string) => void;
  onSelectCustomer: (customer: CustomerSearchResult) => void;
  onClearCustomer: () => void;
}

function OrdersCustomerSearchBarComponent({
  query,
  selectedCustomerName,
  results,
  isSearching,
  searchError,
  onChangeQuery,
  onSelectCustomer,
  onClearCustomer,
}: OrdersCustomerSearchBarProps) {
  const { horizontalPadding, scale } = useResponsiveLayout();
  const searchBarHeight = scale(48);
  const trimmedQuery = query.trim();
  const showHint =
    !selectedCustomerName &&
    trimmedQuery.length > 0 &&
    trimmedQuery.length < customerSearchMinLength;
  const showResults =
    !selectedCustomerName &&
    trimmedQuery.length >= customerSearchMinLength &&
    (isSearching || results.length > 0 || searchError != null || !isSearching);

  const handleClearQuery = useCallback(() => {
    onChangeQuery('');
  }, [onChangeQuery]);

  const handleSelect = useCallback(
    (customer: CustomerSearchResult) => {
      onSelectCustomer(customer);
    },
    [onSelectCustomer],
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingTop: scale(10),
          paddingBottom: scale(10),
        },
      ]}>
      {selectedCustomerName ? (
        <HStack className="items-center gap-2 rounded-full border border-tertiary-200 bg-background-0 px-3 py-2">
          <Text size="sm" className="flex-1 text-typography-900">
            {ordersCopy.selectedCustomerLabel} {selectedCustomerName}
          </Text>
          <Pressable
            onPress={onClearCustomer}
            accessibilityRole="button"
            accessibilityLabel={ordersCopy.clearSelectedCustomerA11y}
            hitSlop={8}
            style={styles.clearButton}>
            <X color={lightTokens.typography500} size={16} />
          </Pressable>
        </HStack>
      ) : (
        <>
          <View
            style={[
              styles.searchBar,
              {
                height: searchBarHeight,
                borderRadius: searchBarHeight / 2,
                paddingHorizontal: scale(14),
              },
            ]}>
            {isSearching ? (
              <ActivityIndicator color={lightTokens.tertiary600} size="small" />
            ) : (
              <Search color={lightTokens.typography500} size={18} />
            )}

            <TextInput
              value={query}
              onChangeText={onChangeQuery}
              placeholder={ordersCopy.searchPlaceholder}
              placeholderTextColor={lightTokens.typography500}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="never"
              style={[styles.input, { fontSize: scale(15) }]}
            />

            {query.length > 0 ? (
              <Pressable
                onPress={handleClearQuery}
                accessibilityRole="button"
                accessibilityLabel={ordersCopy.searchClearA11y}
                hitSlop={8}
                style={styles.clearButton}>
                <X color={lightTokens.typography500} size={16} />
              </Pressable>
            ) : null}
          </View>

          {showHint ? (
            <Text size="xs" className="mt-2 text-typography-500">
              {ordersCopy.searchCustomerHint}
            </Text>
          ) : null}

          {showResults ? (
            <Box className="mt-2 overflow-hidden rounded-xl border border-outline-100 bg-background-0">
              {searchError ? (
                <Text size="sm" className="px-3 py-3 text-error-500">
                  {searchError}
                </Text>
              ) : isSearching ? (
                <HStack className="items-center gap-2 px-3 py-3">
                  <ActivityIndicator
                    color={lightTokens.tertiary600}
                    size="small"
                  />
                  <Text size="sm" className="text-typography-500">
                    {ordersCopy.loadingOrders}
                  </Text>
                </HStack>
              ) : results.length === 0 ? (
                <Text size="sm" className="px-3 py-3 text-typography-500">
                  {ordersCopy.searchCustomerEmpty}
                </Text>
              ) : (
                <VStack>
                  {results.map((customer, index) => (
                    <Pressable
                      key={customer.id}
                      onPress={() => handleSelect(customer)}
                      accessibilityRole="button"
                      className={`px-3 py-2.5 ${
                        index < results.length - 1
                          ? 'border-b border-outline-100'
                          : ''
                      }`}>
                      <Text
                        size="sm"
                        className="font-semibold text-typography-900">
                        {customer.name}
                      </Text>
                      {customer.phone ? (
                        <Text size="xs" className="mt-0.5 text-typography-500">
                          {customer.phone}
                        </Text>
                      ) : null}
                    </Pressable>
                  ))}
                </VStack>
              )}
            </Box>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTokens.background50,
    zIndex: 10,
  },
  searchBar: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary200,
    backgroundColor: lightTokens.background0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
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

export const OrdersCustomerSearchBar = memo(OrdersCustomerSearchBarComponent);
