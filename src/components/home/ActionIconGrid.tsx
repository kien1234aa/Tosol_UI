import React, { memo, useCallback } from 'react';
import type { DimensionValue } from 'react-native';
import {
  ClipboardList,
  CreditCard,
  FilePlus,
  Truck,
  type LucideIcon,
} from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import type {
  HomeActionItem,
  HomeActionKey,
  HomeBadges,
} from '@/src/types/home/home.types';
import { ActionIconButton } from './ActionIconButton';

/** Maps each action key to a lucide icon, keeping config free of RN imports. */
const HOME_ACTION_ICONS: Record<HomeActionKey, LucideIcon> = {
  orderCreate: FilePlus,
  orderList: ClipboardList,
  orderPayment: CreditCard,
  orderReady: Truck,
  packageCreate: FilePlus,
  packageList: ClipboardList,
  packagePayment: CreditCard,
  packageReady: Truck,
};

interface ActionIconGridProps {
  title: string;
  items: HomeActionItem[];
  /** When omitted, columns are derived from screen width. */
  columns?: number;
  badges?: HomeBadges;
  onPressItem?: (key: HomeActionKey) => void;
}

function ActionIconGridComponent({
  title,
  items,
  columns,
  badges,
  onPressItem,
}: ActionIconGridProps) {
  const { homeActionColumns, gridGap } = useResponsiveLayout();
  const resolvedColumns = columns ?? homeActionColumns(items.length);
  const itemWidth: DimensionValue = `${100 / resolvedColumns}%`;

  const handlePress = useCallback(
    (key: HomeActionKey) => () => onPressItem?.(key),
    [onPressItem],
  );

  return (
    <VStack className="w-full" space="md">
      <Text size="lg" className="font-bold text-typography-900">
        {title}
      </Text>

      <HStack className="w-full flex-wrap">
        {items.map(item => (
          <Box
            key={item.key}
            style={{
              width: itemWidth,
              marginBottom: gridGap,
              paddingHorizontal: gridGap / 2,
            }}>
            <ActionIconButton
              label={item.label}
              icon={HOME_ACTION_ICONS[item.key]}
              badge={badges?.[item.key]}
              onPress={handlePress(item.key)}
            />
          </Box>
        ))}
      </HStack>
    </VStack>
  );
}

export const ActionIconGrid = memo(ActionIconGridComponent);
