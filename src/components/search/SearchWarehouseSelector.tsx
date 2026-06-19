import React, { memo, useCallback, useState } from 'react';
import { Modal, Pressable as RNPressable, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { searchCopy } from '@/src/configs/search';
import { preferencesCopy } from '@/src/configs/preferences/preferences.constants';
import { ALL_WAREHOUSES_ID, isAllWarehouses } from '@/src/configs/warehouse';
import { lightTokens } from '@/src/configs/theme';
import type { AuthWarehouse } from '@/src/types/login/auth.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

const EMPTY_SUGGESTED_WAREHOUSE_IDS: number[] = [];

interface SearchWarehouseSelectorProps {
  warehouses: AuthWarehouse[];
  selectedWarehouseId: number | null;
  selectedLabel: string;
  isLoading?: boolean;
  suggestedWarehouseIds?: number[];
  onSelect: (warehouseId: number | null) => void;
}

const CHEVRON_SIZE = 14;

function SearchWarehouseSelectorComponent({
  warehouses,
  selectedWarehouseId,
  selectedLabel,
  isLoading = false,
  suggestedWarehouseIds = EMPTY_SUGGESTED_WAREHOUSE_IDS,
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

  const suggestedWarehouses = suggestedWarehouseIds
    .map(id => warehouses.find(warehouse => warehouse.id === id))
    .filter((warehouse): warehouse is AuthWarehouse => warehouse != null);
  const suggestedIdSet = new Set(suggestedWarehouseIds);
  const remainingWarehouses = warehouses.filter(
    warehouse => !suggestedIdSet.has(warehouse.id),
  );

  const renderWarehouseOption = (warehouse: AuthWarehouse) => {
    const isSelected = warehouse.id === selectedWarehouseId;

    return (
      <Pressable
        key={warehouse.id}
        onPress={() => handleSelect(warehouse.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        style={[styles.option, isSelected && styles.optionSelected]}>
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
  };

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

              {suggestedWarehouses.length > 0 ? (
                <>
                  <Text
                    size="xs"
                    className="px-1 pt-1 font-semibold uppercase tracking-wide text-typography-500">
                    {preferencesCopy.recentSection}
                  </Text>
                  {suggestedWarehouses.map(renderWarehouseOption)}
                  {remainingWarehouses.length > 0 ? (
                    <Box className="my-1 h-px bg-outline-100" />
                  ) : null}
                </>
              ) : null}

              {remainingWarehouses.map(renderWarehouseOption)}
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
