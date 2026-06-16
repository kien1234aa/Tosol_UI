import React, { memo } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { walletCopy } from '@/src/configs/wallet';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
  lightTokens,
} from '@/src/configs/theme';
import type { WalletMode } from '@/src/types/wallet/wallet.types';
import { Box } from '@/src/uikits/box';
import { Input, InputField } from '@/src/uikits/input';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface WalletFormProps {
  mode: WalletMode;
  amount: string;
  onChangeAmount: (value: string) => void;
  onPrimary: () => void;
  onSecondary: () => void;
}

function WalletFormComponent({
  mode,
  amount,
  onChangeAmount,
  onPrimary,
  onSecondary,
}: WalletFormProps) {
  const isTopup = mode === 'topup';
  const placeholder = isTopup
    ? walletCopy.topupPlaceholder
    : walletCopy.withdrawPlaceholder;
  const primaryLabel = isTopup ? walletCopy.createQr : walletCopy.createWithdraw;

  return (
    <VStack className="w-full" space="md">
      <Input
        variant="outline"
        size="xl"
        className="rounded-xl border border-outline-200 bg-background-0 data-[focus=true]:border-tertiary-500"
        style={styles.input}>
        <InputField
          placeholder={placeholder}
          value={amount}
          onChangeText={onChangeAmount}
          keyboardType="number-pad"
          autoCorrect={false}
          placeholderTextColor={lightTokens.typography500}
          className="text-typography-900"
        />
      </Input>

      <RNPressable
        onPress={onPrimary}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        style={[buttonPrimaryCta, styles.primaryButton]}>
        <Text
          size="md"
          className="font-semibold text-typography-0"
          style={buttonLabelStyle}>
          {primaryLabel}
        </Text>
      </RNPressable>

      {isTopup ? (
        <RNPressable
          onPress={onSecondary}
          accessibilityRole="button"
          accessibilityLabel={walletCopy.missingMoney}
          style={[buttonPrimaryCta, styles.secondaryButton]}>
          <Text
            size="md"
            className="font-semibold text-typography-0"
            style={buttonLabelStyle}>
            {walletCopy.missingMoney}
          </Text>
        </RNPressable>
      ) : null}

      <Box style={styles.spacer} />
    </VStack>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    height: 56,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: lightTokens.tertiary500,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: lightTokens.tertiary500,
  },
  spacer: {
    height: 4,
  },
});

export const WalletForm = memo(WalletFormComponent);
