import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { AlertCircle, MessageCircle, X } from 'lucide-react-native';
import { ordersCopy } from '@/src/configs/orders';
import { lightTokens } from '@/src/configs/theme';
import { fonts } from '@/src/configs/theme/fonts';
import { fontSizes, lineHeights } from '@/src/configs/theme/typography';
import { Box } from '@/src/uikits/box';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { CreateOrderFieldLabel } from '@/src/components/createOrder/createOrderFormFields';

export interface OrderCancelReasonModalProps {
  visible: boolean;
  orderNumber: string | null;
  reason: string;
  isSubmitting: boolean;
  error: string | null;
  onChangeReason: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const PLACEHOLDER_COLOR = 'rgb(140, 148, 154)';

function OrderCancelReasonModalComponent({
  visible,
  orderNumber,
  reason,
  isSubmitting,
  error,
  onChangeReason,
  onClose,
  onConfirm,
}: OrderCancelReasonModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RNPressable style={styles.overlay} onPress={onClose}>
          <RNPressable style={styles.sheet} onPress={() => {}}>
            <HStack className="mb-4 items-start justify-between">
              <HStack className="min-w-0 flex-1 items-center gap-2.5">
                <Box className="h-10 w-10 items-center justify-center rounded-full bg-error-50">
                  <AlertCircle color={lightTokens.error500} size={20} />
                </Box>
                <VStack className="min-w-0 flex-1" space="xs">
                  <Text size="md" className="font-bold text-typography-900">
                    {ordersCopy.cancelModalTitle}
                  </Text>
                  <Text size="xs" className="text-typography-500">
                    {ordersCopy.cancelModalSubtitle}
                  </Text>
                </VStack>
              </HStack>

              <Pressable
                onPress={onClose}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel={ordersCopy.cancelDismiss}
                className="h-8 w-8 items-center justify-center rounded-full bg-background-50">
                <X color={lightTokens.typography500} size={18} />
              </Pressable>
            </HStack>

            {orderNumber ? (
              <Box className="mb-4 rounded-xl border border-outline-100 bg-background-50 px-3.5 py-3">
                <Text size="xs" className="text-typography-500">
                  {ordersCopy.editModalSubtitle}
                </Text>
                <Text size="sm" className="mt-0.5 font-semibold text-typography-900">
                  {orderNumber}
                </Text>
              </Box>
            ) : null}

            <VStack space="xs">
              <CreateOrderFieldLabel label={ordersCopy.cancelReasonLabel} required />
              <Box style={styles.reasonField}>
                <HStack className="items-start gap-2.5">
                  <Box className="pt-0.5">
                    <MessageCircle
                      color={lightTokens.tertiary600}
                      size={18}
                    />
                  </Box>
                  <TextInput
                    value={reason}
                    onChangeText={onChangeReason}
                    placeholder={ordersCopy.cancelReasonPlaceholder}
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isSubmitting}
                    style={styles.reasonInput}
                  />
                </HStack>
              </Box>
            </VStack>

            {error ? (
              <Box className="mt-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2">
                <Text size="sm" className="text-error-600">
                  {error}
                </Text>
              </Box>
            ) : null}

            <HStack className="mt-5 justify-end gap-2.5">
              <Button
                size="md"
                action="default"
                variant="outline"
                className="h-11 rounded-xl border-outline-200 bg-background-0 px-5"
                onPress={onClose}
                isDisabled={isSubmitting}>
                <ButtonText className="font-semibold text-typography-700">
                  {ordersCopy.cancelDismiss}
                </ButtonText>
              </Button>

              <Button
                size="md"
                action="default"
                variant="solid"
                className="h-11 rounded-xl border-0 bg-error-500 px-5"
                isDisabled={isSubmitting}
                onPress={onConfirm}>
                {isSubmitting ? (
                  <ButtonSpinner color={lightTokens.typography0} />
                ) : (
                  <ButtonText className="font-semibold text-typography-0">
                    {ordersCopy.cancelConfirm}
                  </ButtonText>
                )}
              </Button>
            </HStack>
          </RNPressable>
        </RNPressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  reasonField: {
    minHeight: 112,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
    backgroundColor: lightTokens.background0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  reasonInput: {
    flex: 1,
    minHeight: 88,
    padding: 0,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: lightTokens.typography900,
  },
});

export const OrderCancelReasonModal = memo(OrderCancelReasonModalComponent);
