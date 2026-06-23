import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { productsCopy } from '@/src/configs/products';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
} from '@/src/configs/theme/buttonLayout';
import type {
  CreateProductComboRow,
  ProductSuggestionItem,
} from '@/src/types/products';
import { CreateProductComboEditor } from '@/src/components/profile/CreateProductComboEditor';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export interface CreateProductComboModalProps {
  visible: boolean;
  rows: CreateProductComboRow[];
  sellerId: number | null;
  warehouseId: number | null;
  disabled?: boolean;
  onClose: () => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onSelectProduct: (rowId: string, product: ProductSuggestionItem) => void;
  onChangeQuantity: (rowId: string, quantity: string) => void;
}

function CreateProductComboModalComponent({
  visible,
  rows,
  sellerId,
  warehouseId,
  disabled = false,
  onClose,
  onAddRow,
  onRemoveRow,
  onSelectProduct,
  onChangeQuantity,
}: CreateProductComboModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <HStack className="items-center justify-between px-4 py-3">
          <VStack className="min-w-0 flex-1 pr-3" space="xs">
            <Text size="xl" className="font-bold text-typography-900">
              {productsCopy.comboModalTitle}
            </Text>
            <Text size="sm" className="text-typography-500">
              {productsCopy.comboItemsHint}
            </Text>
          </VStack>
          <Pressable
            onPress={onClose}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={productsCopy.comboModalClose}
            style={styles.closeButton}>
            <X color={lightTokens.typography500} size={20} />
          </Pressable>
        </HStack>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + 96 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <CreateProductComboEditor
              rows={rows}
              sellerId={sellerId}
              warehouseId={warehouseId}
              disabled={disabled}
              onAddRow={onAddRow}
              onRemoveRow={onRemoveRow}
              onSelectProduct={onSelectProduct}
              onChangeQuantity={onChangeQuantity}
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}>
            <Pressable
              onPress={onClose}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={productsCopy.comboModalDone}
              style={[buttonPrimaryCta, styles.doneButton]}>
              <Text
                size="md"
                className="font-semibold text-typography-0"
                style={buttonLabelStyle}>
                {productsCopy.comboModalDone}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightTokens.background50,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: lightTokens.background0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightTokens.outline100,
  },
  doneButton: {
    backgroundColor: lightTokens.tertiary500,
  },
});

export const CreateProductComboModal = memo(CreateProductComboModalComponent);
