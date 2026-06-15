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
import { lightTokens } from '@/src/configs/theme';
import type { SearchPlatformKey } from '@/src/types/search/search.types';
import { SearchPlatformSelector } from './SearchPlatformSelector';

interface SearchHeaderProps {
  query: string;
  selectedPlatform: SearchPlatformKey;
  selectedPlatformLabel: string;
  onChangeQuery: (value: string) => void;
  onSelectPlatform: (key: SearchPlatformKey) => void;
  onPressImageSearch?: () => void;
}

const SEARCH_BAR_HEIGHT = 48;
const CAMERA_ICON_SIZE = 20;
const CAMERA_BUTTON_SIZE = 40;

function SearchHeaderComponent({
  query,
  selectedPlatform,
  selectedPlatformLabel,
  onChangeQuery,
  onSelectPlatform,
  onPressImageSearch,
}: SearchHeaderProps) {
  const handleImageSearch = useCallback(() => {
    onPressImageSearch?.();
  }, [onPressImageSearch]);

  return (
    <Box style={styles.container}>
      <VStack className="w-full" space="md">
        <Text size="md" className="font-medium text-typography-900">
          {searchCopy.greeting}
        </Text>

        <HStack style={styles.searchBar}>
          <SearchPlatformSelector
            selectedKey={selectedPlatform}
            selectedLabel={selectedPlatformLabel}
            onSelect={onSelectPlatform}
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
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBar: {
    height: SEARCH_BAR_HEIGHT,
    borderRadius: SEARCH_BAR_HEIGHT / 2,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
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
