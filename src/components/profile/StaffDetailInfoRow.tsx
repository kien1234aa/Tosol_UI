import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { Text } from '@/src/uikits/text';

interface StaffDetailInfoRowProps {
  label: string;
  value: string;
}

function StaffDetailInfoRowComponent({ label, value }: StaffDetailInfoRowProps) {
  return (
    <View style={styles.row}>
      <Text size="xs" className="text-typography-500" style={styles.label}>
        {label}
      </Text>
      <Text
        size="sm"
        numberOfLines={2}
        className="font-medium text-typography-900"
        style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTokens.outline100,
  },
  label: {
    flexShrink: 0,
    minWidth: 120,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
});

export const StaffDetailInfoRow = memo(StaffDetailInfoRowComponent);
