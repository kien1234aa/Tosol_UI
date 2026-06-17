import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { staffCopy } from '@/src/configs/profile';
import { staffNameInitials } from '@/src/helpers/profile/staff.helpers';
import { lightTokens } from '@/src/configs/theme';
import type { StaffDetailItem } from '@/src/types/profile/staff.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface StaffDetailSummaryCardProps {
  staff: StaffDetailItem;
}

function StaffDetailSummaryCardComponent({ staff }: StaffDetailSummaryCardProps) {
  return (
    <Box style={styles.card}>
      <HStack className="items-center gap-4">
        <Center style={styles.avatar}>
          <Text size="lg" className="font-bold text-tertiary-700">
            {staffNameInitials(staff.name)}
          </Text>
        </Center>

        <VStack className="flex-1" space="xs">
          <Text size="md" className="font-semibold text-typography-900">
            {staff.name}
          </Text>
          <Text size="sm" className="text-typography-600">
            {staff.email}
          </Text>

          <HStack className="flex-wrap gap-2 pt-1">
            <Box
              style={[
                styles.badge,
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
                styles.badge,
                staff.isActive ? styles.activeBadge : styles.inactiveBadge,
              ]}>
              <Text
                size="2xs"
                style={{
                  fontWeight: '600',
                  color: staff.isActive
                    ? 'rgb(21, 128, 61)'
                    : lightTokens.typography500,
                }}>
                {staff.isActive ? staffCopy.active : staffCopy.inactive}
              </Text>
            </Box>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  badge: {
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
  activeBadge: {
    backgroundColor: 'rgb(220, 252, 231)',
  },
  inactiveBadge: {
    backgroundColor: lightTokens.background50,
  },
});

export const StaffDetailSummaryCard = memo(StaffDetailSummaryCardComponent);
