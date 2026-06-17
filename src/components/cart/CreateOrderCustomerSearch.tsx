import React, { memo, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { Search, User } from 'lucide-react-native';
import { createOrderCopy } from '@/src/configs/cart/createOrder.constants';
import { customerSearchMinLength } from '@/src/configs/api';
import { lightTokens } from '@/src/configs/theme';
import type { CustomerSearchResult } from '@/src/types/orders/createOrder.types';
import { Box } from '@/src/uikits/box';
import { FormControl } from '@/src/uikits/form-control';
import { HStack } from '@/src/uikits/hstack';
import { Input, InputField } from '@/src/uikits/input';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import {
  CreateOrderFieldLabel,
  createOrderFieldShellClass,
} from './createOrderFormFields';

interface CreateOrderCustomerSearchProps {
  query: string;
  selectedCustomerName: string | null;
  results: CustomerSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  onChangeQuery: (value: string) => void;
  onSelectCustomer: (customer: CustomerSearchResult) => void;
}

function CreateOrderCustomerSearchComponent({
  query,
  selectedCustomerName,
  results,
  isSearching,
  searchError,
  onChangeQuery,
  onSelectCustomer,
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

  const handleSelect = useCallback(
    (customer: CustomerSearchResult) => {
      onSelectCustomer(customer);
    },
    [onSelectCustomer],
  );

  return (
    <FormControl className="w-full">
      <CreateOrderFieldLabel label={createOrderCopy.customerLabel} />

      <Box className={createOrderFieldShellClass}>
        <HStack className="items-center gap-2">
          <User color={lightTokens.tertiary600} size={18} />
          <Input
            variant="outline"
            size="md"
            className="h-7 flex-1 border-0 bg-transparent shadow-none">
            <InputField
              value={query}
              onChangeText={onChangeQuery}
              placeholder={createOrderCopy.searchCustomerPlaceholder}
              placeholderTextColor={lightTokens.typography500}
              autoCorrect={false}
              autoCapitalize="none"
              className="px-0 text-sm text-typography-900"
            />
          </Input>
          {isSearching ? (
            <ActivityIndicator color={lightTokens.tertiary600} size="small" />
          ) : (
            <Search color={lightTokens.typography500} size={16} />
          )}
        </HStack>
      </Box>

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
        </Box>
      ) : null}
    </FormControl>
  );
}

export const CreateOrderCustomerSearch = memo(CreateOrderCustomerSearchComponent);
