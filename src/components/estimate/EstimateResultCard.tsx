import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { estimateCopy } from '@/src/configs/estimate';
import { formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import type { EstimateResult } from '@/src/types/estimate/estimate.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface EstimateResultCardProps {
  result: EstimateResult;
}

interface DetailRowProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

function DetailRow({ label, value, emphasize = false }: DetailRowProps) {
  return (
    <HStack className="w-full items-center justify-between" space="md">
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
      <Text
        size="sm"
        numberOfLines={1}
        className={
          emphasize
            ? 'flex-1 text-right font-bold text-tertiary-600'
            : 'flex-1 text-right font-medium text-typography-900'
        }>
        {value}
      </Text>
    </HStack>
  );
}

function EstimateResultCardComponent({ result }: EstimateResultCardProps) {
  const isBuyForMe = result.mode === 'buyForMe';

  return (
    <Box style={styles.card}>
      <VStack space="md">
        <Text size="md" className="font-bold text-typography-900">
          {estimateCopy.resultTitle}
        </Text>

        {isBuyForMe ? (
          <>
            <DetailRow
              label={estimateCopy.goodsLabel}
              value={formatOrderPrice(result.goodsVnd)}
            />
            <DetailRow
              label={estimateCopy.serviceFeeLabel}
              value={formatOrderPrice(result.serviceFeeVnd)}
            />
          </>
        ) : null}

        <DetailRow
          label={estimateCopy.chargeableWeightLabel}
          value={`${result.chargeableWeightKg} kg`}
        />
        <DetailRow
          label={estimateCopy.shippingLabel}
          value={formatOrderPrice(result.shippingVnd)}
        />

        <Box style={styles.divider} />

        <DetailRow
          label={estimateCopy.totalLabel}
          value={formatOrderPrice(result.totalVnd)}
          emphasize
        />

        <Text size="xs" className="text-typography-500">
          {estimateCopy.resultNote}
        </Text>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  divider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
  },
});

export const EstimateResultCard = memo(EstimateResultCardComponent);
