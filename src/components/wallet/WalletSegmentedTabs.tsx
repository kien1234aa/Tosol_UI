import React, { memo, useCallback } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { Clock, MinusCircle, PlusCircle } from 'lucide-react-native';
import { walletCopy } from '@/src/configs/wallet';
import { lightTokens } from '@/src/configs/theme';
import type { WalletMode, WalletTab } from '@/src/types/wallet/wallet.types';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';

interface WalletSegmentedTabsProps {
  mode: WalletMode;
  activeTab: WalletTab;
  onChange: (tab: WalletTab) => void;
}

const ICON_SIZE = 18;

function WalletSegmentedTabsComponent({
  mode,
  activeTab,
  onChange,
}: WalletSegmentedTabsProps) {
  const handleForm = useCallback(() => onChange('form'), [onChange]);
  const handleHistory = useCallback(() => onChange('history'), [onChange]);

  const isFormActive = activeTab === 'form';
  const formLabel =
    mode === 'topup' ? walletCopy.topupTab : walletCopy.withdrawTab;
  const FormIcon = mode === 'topup' ? PlusCircle : MinusCircle;

  const formColor = isFormActive
    ? lightTokens.tertiary600
    : lightTokens.typography500;
  const historyColor = !isFormActive
    ? lightTokens.tertiary600
    : lightTokens.typography500;

  return (
    <HStack style={styles.container}>
      <RNPressable
        onPress={handleForm}
        accessibilityRole="button"
        accessibilityState={{ selected: isFormActive }}
        accessibilityLabel={formLabel}
        style={[styles.segment, isFormActive && styles.segmentActive]}>
        <FormIcon color={formColor} size={ICON_SIZE} />
        <Text
          size="sm"
          className="font-semibold"
          style={{ color: formColor }}>
          {formLabel}
        </Text>
      </RNPressable>

      <RNPressable
        onPress={handleHistory}
        accessibilityRole="button"
        accessibilityState={{ selected: !isFormActive }}
        accessibilityLabel={walletCopy.historyTab}
        style={[styles.segment, !isFormActive && styles.segmentActive]}>
        <Clock color={historyColor} size={ICON_SIZE} />
        <Text
          size="sm"
          className="font-semibold"
          style={{ color: historyColor }}>
          {walletCopy.historyTab}
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

export const WalletSegmentedTabs = memo(WalletSegmentedTabsComponent);
