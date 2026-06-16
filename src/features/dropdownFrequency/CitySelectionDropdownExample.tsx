import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFrequencyDropdown } from './useFrequencyDropdown';

const CITY_DROPDOWN_KEY = 'citySelection';

const CITY_OPTIONS = [
  { value: 'hanoi', label: 'Ha Noi' },
  { value: 'hochiminh', label: 'Ho Chi Minh City' },
  { value: 'danang', label: 'Da Nang' },
  { value: 'haiphong', label: 'Hai Phong' },
] as const;

type CityValue = (typeof CITY_OPTIONS)[number]['value'];

export function CitySelectionDropdownExample() {
  const [selectedCity, setSelectedCity] = useState<CityValue>('hanoi');
  const { sortedOptions, handleSelect } = useFrequencyDropdown(
    CITY_DROPDOWN_KEY,
    CITY_OPTIONS,
  );

  function onCityChange(city: CityValue) {
    setSelectedCity(city);

    // Every successful selection is recorded for this dropdown key.
    handleSelect(city);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>City</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedCity}
          onValueChange={value => onCityChange(value as CityValue)}
        >
          {sortedOptions.map(option => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  pickerWrapper: {
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
