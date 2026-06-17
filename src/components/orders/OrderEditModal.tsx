import React, { memo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable as RNPressable,
  StyleSheet,
} from 'react-native';
import { ordersCopy } from '@/src/configs/orders';
import {
  buttonContentCenter,
  buttonLabelStyle,
  lightTokens,
} from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { Input, InputField } from '@/src/uikits/input';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export interface OrderEditModalProps {
  visible: boolean;
  orderNumber: string | null;
  note: string;
  isSubmitting: boolean;
  error: string | null;
  onChangeNote: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function OrderEditModalComponent({
  visible,
  orderNumber,
  note,
  isSubmitting,
  error,
  onChangeNote,
  onClose,
  onConfirm,
}: OrderEditModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <RNPressable style={styles.overlay} onPress={onClose}>
        <RNPressable style={styles.sheet} onPress={() => {}}>
          <VStack space="md">
            <Text size="md" className="font-semibold text-typography-900">
              {ordersCopy.editModalTitle}
            </Text>

            {orderNumber ? (
              <Text size="sm" className="text-typography-600">
                {ordersCopy.editModalSubtitle}{' '}
                <Text size="sm" className="font-semibold text-typography-900">
                  {orderNumber}
                </Text>
              </Text>
            ) : null}

            <VStack space="xs">
              <Text size="xs" className="text-typography-500">
                {ordersCopy.editNoteLabel}
              </Text>
              <Input
                variant="outline"
                size="md"
                className="min-h-[88px] rounded-xl border border-outline-200 bg-background-0">
                <InputField
                  value={note}
                  onChangeText={onChangeNote}
                  placeholder={ordersCopy.editNotePlaceholder}
                  placeholderTextColor={lightTokens.typography500}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="px-3 py-3 text-sm text-typography-900"
                />
              </Input>
            </VStack>

            {error ? (
              <Text size="sm" className="text-error-500">
                {error}
              </Text>
            ) : null}

            <Box className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={isSubmitting}
                accessibilityRole="button"
                style={[styles.dismissButton, buttonContentCenter]}>
                <Text
                  size="sm"
                  className="font-semibold text-typography-700"
                  style={buttonLabelStyle}>
                  {ordersCopy.editDismiss}
                </Text>
              </Pressable>

              <Pressable
                onPress={onConfirm}
                disabled={isSubmitting}
                accessibilityRole="button"
                style={[
                  styles.confirmButton,
                  buttonContentCenter,
                  isSubmitting && styles.confirmButtonDisabled,
                ]}>
                {isSubmitting ? (
                  <ActivityIndicator color={lightTokens.typography0} size="small" />
                ) : (
                  <Text
                    size="sm"
                    className="font-semibold text-typography-0"
                    style={buttonLabelStyle}>
                    {ordersCopy.editSave}
                  </Text>
                )}
              </Pressable>
            </Box>
          </VStack>
        </RNPressable>
      </RNPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  dismissButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
    backgroundColor: lightTokens.background0,
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: lightTokens.tertiary500,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
});

export const OrderEditModal = memo(OrderEditModalComponent);
