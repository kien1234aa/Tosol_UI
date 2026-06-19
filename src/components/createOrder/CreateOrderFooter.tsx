import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { createOrderCopy, draftCopy } from '@/src/configs/createOrder';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import { formatVndPrice } from '@/src/helpers/createOrder';
import { Box } from '@/src/uikits/box';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface CreateOrderFooterProps {
  variant?: 'fixed' | 'inline';
  grandTotalVnd: number;
  orderTotalVnd: number;
  selectedShopBadge: string | null;
  canSubmit: boolean;
  isSubmitting: boolean;
  isLoadingOptions: boolean;
  onSubmit: () => void;
}

function CreateOrderFooterComponent({
  variant = 'fixed',
  grandTotalVnd,
  orderTotalVnd,
  selectedShopBadge,
  canSubmit,
  isSubmitting,
  isLoadingOptions,
  onSubmit,
}: CreateOrderFooterProps) {
  const isSubmitDisabled = isSubmitting || isLoadingOptions || !canSubmit;
  const footerStyle =
    variant === 'inline' ? styles.footerInline : styles.footerFixed;

  return (
    <Box style={footerStyle}>
      <HStack className="mb-2 items-center justify-between">
        <Text size="sm" className="text-typography-600">
          {draftCopy.totalGoodsLabel}
        </Text>
        <Text size="sm" className="font-semibold text-typography-900">
          {formatVndPrice(grandTotalVnd)}
        </Text>
      </HStack>

      <HStack className="mb-3 items-center justify-between">
        {selectedShopBadge ? (
          <Box className="rounded-full bg-tertiary-50 px-2.5 py-1">
            <Text size="xs" className="font-semibold text-tertiary-700">
              {selectedShopBadge}
            </Text>
          </Box>
        ) : (
          <Box />
        )}
        <VStack className="items-end">
          <Text size="xs" className="text-typography-500">
            {createOrderCopy.totalLabel}
          </Text>
          <Text size="lg" className="font-bold text-tertiary-600">
            {formatVndPrice(orderTotalVnd)}
          </Text>
        </VStack>
      </HStack>

      <Button
        size="lg"
        action="default"
        variant="solid"
        className="h-12 w-full rounded-xl border-0 bg-tertiary-500"
        isDisabled={isSubmitDisabled}
        onPress={onSubmit}>
        {isSubmitting ? (
          <ButtonSpinner color={lightTokens.typography0} />
        ) : (
          <>
            <Check color={lightTokens.typography0} size={18} />
            <ButtonText className="text-base font-semibold text-typography-0">
              {draftCopy.createOrder}
            </ButtonText>
          </>
        )}
      </Button>
    </Box>
  );
}

export const CreateOrderFooter = memo(CreateOrderFooterComponent);

const footerBase = {
  paddingHorizontal: 16,
  paddingTop: 12,
  backgroundColor: lightTokens.background0,
  borderTopWidth: 1,
  borderTopColor: lightTokens.outline100,
} as const;

const styles = StyleSheet.create({
  footerFixed: {
    ...footerBase,
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
  },
  footerInline: {
    ...footerBase,
    marginHorizontal: -16,
    paddingBottom: 12,
  },
});
