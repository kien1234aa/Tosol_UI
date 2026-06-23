import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ProfileListStatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
}

function ProfileListStatCardComponent({
  icon: Icon,
  label,
  value,
}: ProfileListStatCardProps) {
  const displayValue =
    typeof value === 'number' ? value.toLocaleString('vi-VN') : value;

  return (
    <Box style={styles.card}>
      <HStack className="items-center gap-3">
        <Box style={styles.iconWrap}>
          <Icon color={lightTokens.tertiary600} size={22} />
        </Box>
        <VStack className="min-w-0 flex-1" space="xs">
          <Text size="sm" className="text-typography-500">
            {label}
          </Text>
          <Text size="2xl" className="font-bold text-typography-900">
            {displayValue}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary100,
  },
});

export const ProfileListStatCard = memo(ProfileListStatCardComponent);
