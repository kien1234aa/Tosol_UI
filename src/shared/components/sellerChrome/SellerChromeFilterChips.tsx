import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { useSellerChromeStyles } from './useSellerChromeStyles';

export type SellerChromeFilterChip<T extends string> = {
  id: T;
  label: string;
};

export type SellerChromeFilterChipsProps<T extends string> = {
  chips: SellerChromeFilterChip<T>[];
  active: T;
  onSelect: (id: T) => void;
};

export function SellerChromeFilterChips<T extends string>({
  chips,
  active,
  onSelect,
}: SellerChromeFilterChipsProps<T>) {
  const s = useSellerChromeStyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {chips.map(chip => {
        const isActive = active === chip.id;
        return (
          <Pressable
            key={chip.id}
            style={[s.chip, isActive && s.chipActive]}
            onPress={() => onSelect(chip.id)}
          >
            <Text style={[s.chipText, isActive && s.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
