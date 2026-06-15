import React, { memo, useCallback, useState } from 'react';
import { Modal, Pressable as RNPressable, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { searchCopy, searchPlatforms } from '@/src/configs/search';
import { lightTokens } from '@/src/configs/theme';
import type { SearchPlatformKey } from '@/src/types/search/search.types';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface SearchPlatformSelectorProps {
  selectedKey: SearchPlatformKey;
  selectedLabel: string;
  onSelect: (key: SearchPlatformKey) => void;
}

const CHEVRON_SIZE = 14;

function SearchPlatformSelectorComponent({
  selectedKey,
  selectedLabel,
  onSelect,
}: SearchPlatformSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openPicker = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (key: SearchPlatformKey) => {
      onSelect(key);
      setIsOpen(false);
    },
    [onSelect],
  );

  return (
    <>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={searchCopy.platformPickerTitle}
        style={styles.trigger}>
        <HStack className="items-center gap-1">
          <Text size="sm" className="font-medium text-typography-900">
            {selectedLabel}
          </Text>
          <ChevronDown color={lightTokens.typography900} size={CHEVRON_SIZE} />
        </HStack>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closePicker}>
        <RNPressable style={styles.overlay} onPress={closePicker}>
          <RNPressable style={styles.sheet} onPress={() => {}}>
            <Text size="md" className="mb-3 font-semibold text-typography-900">
              {searchCopy.platformPickerTitle}
            </Text>
            <VStack space="xs">
              {searchPlatforms.map(platform => {
                const isSelected = platform.key === selectedKey;

                return (
                  <Pressable
                    key={platform.key}
                    onPress={() => handleSelect(platform.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}>
                    <Text
                      size="sm"
                      className={
                        isSelected
                          ? 'font-semibold text-tertiary-700'
                          : 'text-typography-900'
                      }>
                      {platform.label}
                    </Text>
                  </Pressable>
                );
              })}
            </VStack>
          </RNPressable>
        </RNPressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  option: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: lightTokens.tertiary50,
  },
});

export const SearchPlatformSelector = memo(SearchPlatformSelectorComponent);
