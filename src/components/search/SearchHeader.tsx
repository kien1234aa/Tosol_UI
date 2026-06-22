import React, { memo, useCallback } from 'react';
import { Keyboard, StyleSheet, TextInput } from 'react-native';
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
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import type { AuthWarehouse } from '@/src/types/login/auth.types';
import { SearchWarehouseSelector } from './SearchWarehouseSelector';

const EMPTY_SUGGESTED_WAREHOUSE_IDS: number[] = [];
const EMPTY_RECENT_QUERIES: string[] = [];

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
  suggestedWarehouseIds = EMPTY_SUGGESTED_WAREHOUSE_IDS,
  recentQueries = EMPTY_RECENT_QUERIES,
  onSelectRecentQuery,
}: SearchHeaderProps) {
  const { horizontalPadding, scale } = useResponsiveLayout();
  const searchBarHeight = scale(48);
  const cameraButtonSize = scale(CAMERA_BUTTON_SIZE);

  const handleImageSearch = useCallback(() => {
    onPressImageSearch?.();
  }, [onPressImageSearch]);

  const handleSubmitSearch = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <Box
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingTop: scale(10),
          paddingBottom: scale(10),
        },
      ]}>
      <VStack className="w-full" space="sm">
        <Text size="md" className="font-medium text-typography-900">
          {searchCopy.greeting}
        </Text>

        <HStack
          style={[
            styles.searchBar,
            {
              height: searchBarHeight,
              borderRadius: searchBarHeight / 2,
            },
          ]}>
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
            onSubmitEditing={handleSubmitSearch}
            style={[
              styles.input,
              { fontSize: scale(15), paddingLeft: scale(12) },
            ]}
          />

          <Pressable
            onPress={handleImageSearch}
            accessibilityRole="button"
            accessibilityLabel={searchCopy.imageSearchLabel}
            style={styles.cameraButton}>
            <Center
              style={[
                styles.cameraIconWrap,
                {
                  width: cameraButtonSize,
                  height: cameraButtonSize,
                  borderRadius: cameraButtonSize / 2,
                },
              ]}>
              <Camera
                color={lightTokens.tertiary600}
                size={scale(CAMERA_ICON_SIZE)}
              />
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
    backgroundColor: lightTokens.tertiary50,
  },
  searchBar: {
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
    paddingRight: 4,
    paddingVertical: 0,
    color: lightTokens.typography900,
  },
  cameraButton: {
    height: '100%',
    paddingRight: 6,
    justifyContent: 'center',
  },
  cameraIconWrap: {},
});

export const SearchHeader = memo(SearchHeaderComponent);
