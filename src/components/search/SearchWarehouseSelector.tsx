import React, { memo, useCallback, useState } from 'react';
import { Modal, Pressable as RNPressable, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { searchCopy } from '@/src/configs/search';
import { ALL_WAREHOUSES_ID, isAllWarehouses } from '@/src/configs/warehouse';
import { lightTokens } from '@/src/configs/theme';
import type { AuthWarehouse } from '@/src/types/login/auth.types';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface SearchWarehouseSelectorProps {
  warehouses: AuthWarehouse[];
  selectedWarehouseId: number | null;
  selectedLabel: string;
  isLoading?: boolean;
  onSelect: (warehouseId: number | null) => void;
}

const CHEVRON_SIZE = 14;

function SearchWarehouseSelectorComponent({
  warehouses,
  selectedWarehouseId,
  selectedLabel,
  isLoading = false,
  onSelect,
}: SearchWarehouseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDisabled = warehouses.length === 0 || isLoading;

  const openPicker = useCallback(() => {
    if (!isDisabled) {
      setIsOpen(true);
    }
  }, [isDisabled]);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelectAll = useCallback(() => {
    onSelect(ALL_WAREHOUSES_ID);
    setIsOpen(false);
  }, [onSelect]);

  const handleSelect = useCallback(
    (warehouseId: number) => {
      onSelect(warehouseId);
      setIsOpen(false);
    },
    [onSelect],
  );

  const isAllSelected = isAllWarehouses(selectedWarehouseId);

  return (
    <>
      <Pressable
        onPress={openPicker}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={searchCopy.warehousePickerTitle}
        accessibilityState={{ disabled: isDisabled }}
        style={[styles.trigger, isDisabled && styles.triggerDisabled]}>
        <HStack className="items-center gap-1">
          <Text
            size="sm"
            numberOfLines={1}
            className="max-w-[88px] font-medium text-typography-900">
            {selectedLabel}
          </Text>
          {!isDisabled ? (
            <ChevronDown color={lightTokens.typography900} size={CHEVRON_SIZE} />
          ) : null}
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
              {searchCopy.warehousePickerTitle}
            </Text>
            <VStack space="xs">
              <Pressable
                onPress={handleSelectAll}
                accessibilityRole="button"
                accessibilityState={{ selected: isAllSelected }}
                style={[styles.option, isAllSelected && styles.optionSelected]}>
                <Text
                  size="sm"
                  className={
                    isAllSelected
                      ? 'font-semibold text-tertiary-700'
                      : 'text-typography-900'
                  }>
                  {searchCopy.allWarehousesLabel}
                </Text>
              </Pressable>

              {warehouses.map(warehouse => {
                const isSelected = warehouse.id === selectedWarehouseId;

                return (
                  <Pressable
                    key={warehouse.id}
                    onPress={() => handleSelect(warehouse.id)}
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
                      {warehouse.name}
                    </Text>
                    {warehouse.code ? (
                      <Text size="xs" className="mt-0.5 text-typography-500">
                        {warehouse.code}
                      </Text>
                    ) : null}
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
    maxWidth: 120,
  },
  triggerDisabled: {
    opacity: 0.85,
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
    borderWidth: StyleSheet.hairlineWidth,
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

export const SearchWarehouseSelector = memo(SearchWarehouseSelectorComponent);
