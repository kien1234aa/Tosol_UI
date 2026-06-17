import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Mail, Phone } from 'lucide-react-native';
import { staffCopy } from '@/src/configs/profile';
import { lightTokens } from '@/src/configs/theme';
import type { StaffListItem } from '@/src/types/profile/staff.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface StaffListCardProps {
  staff: StaffListItem;
  onPress?: (staffUuid: string) => void;
}

function StaffListCardComponent({ staff, onPress }: StaffListCardProps) {
  const handlePress = () => {
    onPress?.(staff.uuid);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={staff.name}
      disabled={!onPress}>
      <Box style={styles.card}>
      <HStack className="items-start justify-between gap-3">
        <VStack className="flex-1" space="xs">
          <Text size="sm" className="font-semibold text-typography-900">
            {staff.name}
          </Text>

          <HStack className="items-center gap-2">
            <Mail color={lightTokens.typography500} size={14} />
            <Text size="xs" className="flex-1 text-typography-600">
              {staff.email}
            </Text>
          </HStack>

          <HStack className="items-center gap-2">
            <Phone color={lightTokens.typography500} size={14} />
            <Text size="xs" className="flex-1 text-typography-600">
              {staff.phone || staffCopy.noPhone}
            </Text>
          </HStack>
        </VStack>

        <VStack className="items-end" space="xs">
          <Box
            style={[
              styles.roleBadge,
              staff.role === 'admin' ? styles.adminBadge : styles.staffBadge,
            ]}>
            <Text
              size="2xs"
              className={
                staff.role === 'admin'
                  ? 'font-semibold text-tertiary-700'
                  : 'font-semibold text-typography-700'
              }>
              {staff.roleLabel}
            </Text>
          </Box>

          <Box
            style={[
              styles.statusBadge,
              staff.isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}>
            <Text
              size="2xs"
              style={{
                fontWeight: '500',
                color: staff.isActive
                  ? 'rgb(21, 128, 61)'
                  : lightTokens.typography500,
              }}>
              {staff.isActive ? staffCopy.active : staffCopy.inactive}
            </Text>
          </Box>
        </VStack>
      </HStack>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  roleBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adminBadge: {
    backgroundColor: lightTokens.tertiary50,
  },
  staffBadge: {
    backgroundColor: lightTokens.background50,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: 'rgb(220, 252, 231)',
  },
  inactiveBadge: {
    backgroundColor: lightTokens.background50,
  },
});

export const StaffListCard = memo(StaffListCardComponent);
