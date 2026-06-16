import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { consignmentStatusLabels } from '@/src/configs/consignment';
import { lightTokens } from '@/src/configs/theme';
import type { ConsignmentOrderStatus } from '@/src/types/consignment/consignment.types';
import { Box } from '@/src/uikits/box';
import { Text } from '@/src/uikits/text';

interface ConsignmentStatusBadgeProps {
  status: ConsignmentOrderStatus;
}

const STATUS_STYLES: Record<
  ConsignmentOrderStatus,
  { backgroundColor: string; color: string }
> = {
  awaitingChinaWarehouse: {
    backgroundColor: lightTokens.tertiary50,
    color: lightTokens.tertiary600,
  },
  inChinaWarehouse: {
    backgroundColor: lightTokens.tertiary100,
    color: lightTokens.tertiary600,
  },
  inTransit: {
    backgroundColor: '#FFF4E5',
    color: '#B45309',
  },
  inVietnamWarehouse: {
    backgroundColor: '#E8F7EE',
    color: '#15803D',
  },
  delivered: {
    backgroundColor: lightTokens.background100,
    color: lightTokens.typography900,
  },
};

function ConsignmentStatusBadgeComponent({
  status,
}: ConsignmentStatusBadgeProps) {
  const palette = STATUS_STYLES[status];

  return (
    <Box style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text size="xs" className="font-medium" style={{ color: palette.color }}>
        {consignmentStatusLabels[status]}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export const ConsignmentStatusBadge = memo(ConsignmentStatusBadgeComponent);
