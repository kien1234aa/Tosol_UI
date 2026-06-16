import React from 'react';
import { StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { HStack } from '@/src/uikits/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/src/uikits/input';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { lightTokens } from '@/src/configs/theme';

export interface SellerListToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filterChips?: Array<{ id: string; label: string; active?: boolean }>;
  onFilterPress?: (id: string) => void;
}

export function SellerListToolbar({
  searchValue,
  onSearchChange,
  placeholder = 'Tìm kiếm...',
  filterChips = [],
  onFilterPress,
}: SellerListToolbarProps) {
  return (
    <>
      <Input variant="outline" size="md" className="rounded-xl border-secondary-200 bg-background-50">
        <InputSlot className="pl-3">
          <InputIcon as={Search} className="text-typography-500" />
        </InputSlot>
        <InputField
          placeholder={placeholder}
          value={searchValue}
          onChangeText={onSearchChange}
        />
      </Input>
      {filterChips.length > 0 ? (
        <HStack className="mt-3 flex-wrap gap-2">
          {filterChips.map(chip => (
            <Pressable
              key={chip.id}
              onPress={() => onFilterPress?.(chip.id)}
              style={[
                styles.chip,
                chip.active ? styles.chipActive : styles.chipInactive,
              ]}>
              <Text
                size="sm"
                className={chip.active ? 'text-typography-0' : 'text-typography-700'}>
                {chip.label}
              </Text>
            </Pressable>
          ))}
        </HStack>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: lightTokens.tertiary500,
  },
  chipInactive: {
    backgroundColor: lightTokens.secondary200,
  },
});
