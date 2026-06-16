import React, { memo, useCallback } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { ShoppingCart, Truck } from 'lucide-react-native';
import { estimateCopy } from '@/src/configs/estimate';
import { lightTokens } from '@/src/configs/theme';
import type { EstimateMode } from '@/src/types/estimate/estimate.types';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';

interface EstimateTabsProps {
  mode: EstimateMode;
  onChange: (mode: EstimateMode) => void;
}

const ICON_SIZE = 18;

function EstimateTabsComponent({ mode, onChange }: EstimateTabsProps) {
  const handleBuyForMe = useCallback(() => onChange('buyForMe'), [onChange]);
  const handleConsignment = useCallback(
    () => onChange('consignment'),
    [onChange],
  );

  const isBuyForMe = mode === 'buyForMe';
  const buyColor = isBuyForMe
    ? lightTokens.tertiary600
    : lightTokens.typography500;
  const consignmentColor = !isBuyForMe
    ? lightTokens.tertiary600
    : lightTokens.typography500;

  return (
    <HStack style={styles.container}>
      <RNPressable
        onPress={handleBuyForMe}
        accessibilityRole="button"
        accessibilityState={{ selected: isBuyForMe }}
        accessibilityLabel={estimateCopy.buyForMeTab}
        style={[styles.segment, isBuyForMe && styles.segmentActive]}>
        <ShoppingCart color={buyColor} size={ICON_SIZE} />
        <Text size="sm" className="font-semibold" style={{ color: buyColor }}>
          {estimateCopy.buyForMeTab}
        </Text>
      </RNPressable>

      <RNPressable
        onPress={handleConsignment}
        accessibilityRole="button"
        accessibilityState={{ selected: !isBuyForMe }}
        accessibilityLabel={estimateCopy.consignmentTab}
        style={[styles.segment, !isBuyForMe && styles.segmentActive]}>
        <Truck color={consignmentColor} size={ICON_SIZE} />
        <Text
          size="sm"
          className="font-semibold"
          style={{ color: consignmentColor }}>
          {estimateCopy.consignmentTab}
        </Text>
      </RNPressable>
    </HStack>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 999,
    padding: 4,
    backgroundColor: lightTokens.background100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 999,
  },
  segmentActive: {
    backgroundColor: lightTokens.background0,
  },
});

export const EstimateTabs = memo(EstimateTabsComponent);
