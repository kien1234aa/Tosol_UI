import React, { memo, useCallback } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { Camera } from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { searchCopy } from '@/src/configs/search';
import { preferencesCopy } from '@/src/configs/preferences/preferences.constants';
import { lightTokens } from '@/src/configs/theme';
import type { AuthWarehouse } from '@/src/types/login/auth.types';
import { SearchWarehouseSelector } from './SearchWarehouseSelector';

interface SearchHeaderProps {
  query: string;
  warehouses: AuthWarehouse[];
  selectedWarehouseId: number | null;
  selectedWarehouseLabel: string;
  onChangeQuery: (value: string) => void;
  onSelectWarehouse: (warehouseId: number | null) => void;
  isSwitchingWarehouse?: boolean;
  onPressImageSearch?: () => void;
  suggestedWarehouseIds?: number[];
  recentQueries?: string[];
  onSelectRecentQuery?: (query: string) => void;
}

const SEARCH_BAR_HEIGHT = 48;
const CAMERA_ICON_SIZE = 20;
const CAMERA_BUTTON_SIZE = 40;

function SearchHeaderComponent({
  query,
  warehouses,
  selectedWarehouseId,
  selectedWarehouseLabel,
  onChangeQuery,
  onSelectWarehouse,
  isSwitchingWarehouse = false,
  onPressImageSearch,
  suggestedWarehouseIds = [],
  recentQueries = [],
  onSelectRecentQuery,
}: SearchHeaderProps) {
  const handleImageSearch = useCallback(() => {
    onPressImageSearch?.();
  }, [onPressImageSearch]);

  return (
    <Box style={styles.container}>
      <VStack className="w-full" space="sm">
        <Text size="md" className="font-medium text-typography-900">
          {searchCopy.greeting}
        </Text>

        <HStack style={styles.searchBar}>
          <SearchWarehouseSelector
            warehouses={warehouses}
            selectedWarehouseId={selectedWarehouseId}
            selectedLabel={selectedWarehouseLabel}
            isLoading={isSwitchingWarehouse}
            suggestedWarehouseIds={suggestedWarehouseIds}
            onSelect={onSelectWarehouse}
          />

          <Box style={styles.divider} />

          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={searchCopy.searchPlaceholder}
            placeholderTextColor={lightTokens.typography500}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />

          <Pressable
            onPress={handleImageSearch}
            accessibilityRole="button"
            accessibilityLabel={searchCopy.imageSearchLabel}
            style={styles.cameraButton}>
            <Center style={styles.cameraIconWrap}>
              <Camera color={lightTokens.tertiary600} size={CAMERA_ICON_SIZE} />
            </Center>
          </Pressable>
        </HStack>

        {!query.trim() && recentQueries.length > 0 ? (
          <VStack space="xs">
            <Text size="xs" className="font-semibold text-typography-500">
              {preferencesCopy.recentSearches}
            </Text>
            <HStack className="flex-wrap gap-2">
              {recentQueries.map(item => (
                <Pressable
                  key={item}
                  onPress={() => onSelectRecentQuery?.(item)}
                  accessibilityRole="button"
                  className="rounded-full border border-outline-200 bg-background-0 px-3 py-1.5">
                  <Text size="xs" className="text-typography-700">
                    {item}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: lightTokens.tertiary50,
  },
  searchBar: {
    height: SEARCH_BAR_HEIGHT,
    borderRadius: SEARCH_BAR_HEIGHT / 2,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary200,
    alignItems: 'center',
    overflow: 'hidden',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: lightTokens.outline200,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 0,
    fontSize: 15,
    color: lightTokens.typography900,
  },
  cameraButton: {
    height: '100%',
    paddingRight: 6,
    justifyContent: 'center',
  },
  cameraIconWrap: {
    width: CAMERA_BUTTON_SIZE,
    height: CAMERA_BUTTON_SIZE,
    borderRadius: CAMERA_BUTTON_SIZE / 2,
  },
});

export const SearchHeader = memo(SearchHeaderComponent);
