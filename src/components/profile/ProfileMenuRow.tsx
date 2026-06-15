import React, { memo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface ProfileMenuRowProps {
  label: string;
  onPress?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
  showChevron?: boolean;
}

function ProfileMenuRowComponent({
  label,
  onPress,
  danger = false,
  trailing,
  showChevron = true,
}: ProfileMenuRowProps) {
  const labelColor = danger ? lightTokens.error500 : lightTokens.typography900;
  const chevronColor = danger ? lightTokens.error500 : lightTokens.typography500;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.row}>
      <HStack className="w-full items-center justify-between">
        <Text
          size="sm"
          className="flex-1 font-medium"
          style={{ color: labelColor }}>
          {label}
        </Text>

        {trailing ? (
          trailing
        ) : showChevron ? (
          <ChevronRight color={chevronColor} size={18} />
        ) : null}
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
  },
});

export const ProfileMenuRow = memo(ProfileMenuRowComponent);
