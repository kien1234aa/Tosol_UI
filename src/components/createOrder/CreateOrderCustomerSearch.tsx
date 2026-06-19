import React, { memo, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { Search, User, UserPlus } from 'lucide-react-native';
import { createOrderCopy } from '@/src/configs/createOrder/createOrder.constants';
import { createCustomerCopy } from '@/src/configs/createOrder/createCustomer.constants';
import { preferencesCopy } from '@/src/configs/preferences/preferences.constants';
import { customerSearchMinLength } from '@/src/configs/api';
import { lightTokens } from '@/src/configs/theme';
import type { CustomerSearchResult } from '@/src/types/orders/createOrder.types';
import { Box } from '@/src/uikits/box';
import { FormControl } from '@/src/uikits/form-control';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import {
  CreateOrderFieldLabel,
  CreateOrderTextInput,
} from './createOrderFormFields';

const EMPTY_RECENT_CUSTOMERS: CustomerSearchResult[] = [];

interface CreateOrderCustomerSearchProps {
  query: string;
  selectedCustomerName: string | null;
  results: CustomerSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  recentCustomers?: CustomerSearchResult[];
  onChangeQuery: (value: string) => void;
  onSelectCustomer: (customer: CustomerSearchResult) => void;
  onPressCreateCustomer?: () => void;
}

function CreateOrderCustomerSearchComponent({
  query,
  selectedCustomerName,
  results,
  isSearching,
  searchError,
  recentCustomers = EMPTY_RECENT_CUSTOMERS,
  onChangeQuery,
  onSelectCustomer,
  onPressCreateCustomer,
}: CreateOrderCustomerSearchProps) {
  const trimmedQuery = query.trim();
  const showHint =
    !selectedCustomerName &&
    trimmedQuery.length > 0 &&
    trimmedQuery.length < customerSearchMinLength;
  const showResults =
    !selectedCustomerName &&
    trimmedQuery.length >= customerSearchMinLength &&
    (isSearching || results.length > 0 || searchError != null || !isSearching);

  const showRecentCustomers =
    !selectedCustomerName &&
    trimmedQuery.length < customerSearchMinLength &&
    recentCustomers.length > 0;

  const handleSelect = useCallback(
    (customer: CustomerSearchResult) => {
      onSelectCustomer(customer);
    },
    [onSelectCustomer],
  );

  return (
    <FormControl className="w-full">
      <CreateOrderFieldLabel label={createOrderCopy.customerLabel} />

      <CreateOrderTextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder={createOrderCopy.searchCustomerPlaceholder}
        autoCapitalize="none"
        autoCorrect={false}
        leadingIcon={<User color={lightTokens.tertiary600} size={18} />}
        trailingIcon={
          isSearching ? (
            <ActivityIndicator color={lightTokens.tertiary600} size="small" />
          ) : (
            <Search color={lightTokens.typography500} size={16} />
          )
        }
      />

      {selectedCustomerName ? (
        <Text size="xs" className="mt-1.5 text-tertiary-700">
          Đã chọn: {selectedCustomerName}
        </Text>
      ) : null}

      {showHint ? (
        <Text size="xs" className="mt-2 text-typography-500">
          {createOrderCopy.searchCustomerHint}
        </Text>
      ) : null}

      {showRecentCustomers ? (
        <Box className="mt-2 overflow-hidden rounded-xl border border-outline-100 bg-background-0">
          <Text
            size="xs"
            className="border-b border-outline-100 px-3 py-2 font-semibold uppercase tracking-wide text-typography-500">
            {preferencesCopy.recentSection}
          </Text>
          <VStack>
            {recentCustomers.map((customer, index) => (
              <Pressable
                key={customer.id}
                onPress={() => handleSelect(customer)}
                accessibilityRole="button"
                className={`px-3 py-2.5 ${
                  index < recentCustomers.length - 1
                    ? 'border-b border-outline-100'
                    : ''
                }`}>
                <Text size="sm" className="font-semibold text-typography-900">
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

          {onPressCreateCustomer ? (
            <Pressable
              onPress={onPressCreateCustomer}
              accessibilityRole="button"
              className="border-t border-outline-100 px-3 py-3">
              <HStack className="items-center gap-2">
                <UserPlus color={lightTokens.tertiary600} size={16} />
                <Text size="sm" className="font-semibold text-tertiary-600">
                  {createCustomerCopy.createButton}
                </Text>
              </HStack>
            </Pressable>
          ) : null}
        </Box>
      ) : null}

      {showResults ? (
        <Box className="mt-2 overflow-hidden rounded-xl border border-outline-100 bg-background-0">
          {searchError ? (
            <Text size="sm" className="px-3 py-3 text-error-500">
              {searchError}
            </Text>
          ) : isSearching ? (
            <HStack className="items-center gap-2 px-3 py-3">
              <ActivityIndicator color={lightTokens.tertiary600} size="small" />
              <Text size="sm" className="text-typography-500">
                {createOrderCopy.loadingOptions}
              </Text>
            </HStack>
          ) : results.length === 0 ? (
            <Text size="sm" className="px-3 py-3 text-typography-500">
              {createOrderCopy.searchCustomerEmpty}
            </Text>
          ) : (
            <VStack>
              {results.map((customer, index) => (
                <Pressable
                  key={customer.id}
                  onPress={() => handleSelect(customer)}
                  accessibilityRole="button"
                  className={`px-3 py-2.5 ${
                    index < results.length - 1 ? 'border-b border-outline-100' : ''
                  }`}>
                  <Text size="sm" className="font-semibold text-typography-900">
                    {customer.name}
                  </Text>
                  {customer.phone ? (
                    <Text size="xs" className="mt-0.5 text-typography-500">
                      {customer.phone}
                    </Text>
                  ) : null}
                  {customer.address || customer.fullAddress ? (
                    <Text
                      size="xs"
                      numberOfLines={2}
                      className="mt-0.5 text-typography-500">
                      {customer.address || customer.fullAddress}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </VStack>
          )}

          {onPressCreateCustomer && !isSearching ? (
            <Pressable
              onPress={onPressCreateCustomer}
              accessibilityRole="button"
              className="border-t border-outline-100 px-3 py-3">
              <HStack className="items-center gap-2">
                <UserPlus color={lightTokens.tertiary600} size={16} />
                <Text size="sm" className="font-semibold text-tertiary-600">
                  {createCustomerCopy.createButton}
                </Text>
              </HStack>
            </Pressable>
          ) : null}
        </Box>
      ) : null}
    </FormControl>
  );
}

export const CreateOrderCustomerSearch = memo(CreateOrderCustomerSearchComponent);
