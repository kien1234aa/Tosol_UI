import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Minus, Plus, Trash2, X } from 'lucide-react-native';
import { draftCopy } from '@/src/configs/createOrder/draft.constants';
import { lightTokens } from '@/src/configs/theme';
import type { DraftProductSuggestionListItem } from '@/src/helpers/createOrder/draftProductSuggestion.helpers';
import { useAddDraftProductSheet } from '@/src/hooks/createOrder/useAddDraftProductSheet';
import type { StagedDraftProduct } from '@/src/helpers/createOrder/draftProductSuggestion.helpers';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import { Box } from '@/src/uikits/box';
import { Button, ButtonText } from '@/src/uikits/button';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export interface AddDraftProductSheetProps {
  visible: boolean;
  draftId: string;
  sellerName: string;
  warehouseId: number | null;
  onClose: () => void;
}

interface StagedItemRowProps {
  item: StagedDraftProduct;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

function StagedItemRowComponent({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: StagedItemRowProps) {
  return (
    <Box style={styles.stagedRow}>
      <HStack className="items-center gap-3">
        <Box style={styles.thumbnailWrap}>
          <ProductThumbnailImage uri={item.suggestion.thumbnailUrl} />
        </Box>
        <VStack className="min-w-0 flex-1" space="xs">
          <Text
            size="sm"
            className="font-medium text-typography-900"
            numberOfLines={2}>
            {item.suggestion.name}
          </Text>
          <Text size="xs" className="text-typography-500">
            SKU: {item.suggestion.sku}
          </Text>
          <HStack className="items-center gap-2">
            <Pressable
              onPress={onDecrease}
              accessibilityRole="button"
              accessibilityLabel={draftCopy.decreaseQuantity}
              style={styles.quantityButton}>
              <Minus color={lightTokens.typography500} size={14} />
            </Pressable>
            <Text size="sm" className="min-w-[24px] text-center font-semibold">
              {item.quantity}
            </Text>
            <Pressable
              onPress={onIncrease}
              accessibilityRole="button"
              accessibilityLabel={draftCopy.increaseQuantity}
              style={styles.quantityButton}>
              <Plus color={lightTokens.typography500} size={14} />
            </Pressable>
          </HStack>
        </VStack>
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={draftCopy.removeProduct}
          hitSlop={8}>
          <Trash2 color={lightTokens.error500} size={18} />
        </Pressable>
      </HStack>
    </Box>
  );
}

const StagedItemRow = memo(StagedItemRowComponent);

function AddDraftProductSheetComponent({
  visible,
  draftId,
  sellerName,
  warehouseId,
  onClose,
}: AddDraftProductSheetProps) {
  const sheet = useAddDraftProductSheet({
    visible,
    draftId,
    sellerName,
    warehouseId,
    onClose,
  });

  const renderSuggestionItem = useCallback(
    ({ item }: { item: DraftProductSuggestionListItem }) => (
      <Pressable
        onPress={() => sheet.onSelectSuggestion(item.suggestion)}
        accessibilityRole="button"
        style={styles.suggestionRow}>
        <HStack className="items-center gap-3">
          <Box style={styles.thumbnailWrap}>
            <ProductThumbnailImage uri={item.suggestion.thumbnailUrl} />
          </Box>
          <VStack className="min-w-0 flex-1" space="xs">
            <Text
              size="md"
              className="font-medium text-typography-900"
              numberOfLines={2}>
              {item.suggestion.name}
            </Text>
            <Text size="sm" className="text-typography-500">
              SKU: {item.suggestion.sku}
            </Text>
          </VStack>
          <Plus color={lightTokens.tertiary600} size={18} />
        </HStack>
      </Pressable>
    ),
    [sheet.onSelectSuggestion],
  );

  const renderStagedItem = useCallback(
    ({ item }: { item: StagedDraftProduct }) => (
      <StagedItemRow
        item={item}
        onIncrease={() => sheet.onIncreaseStagedQuantity(item.productId)}
        onDecrease={() => sheet.onDecreaseStagedQuantity(item.productId)}
        onRemove={() => sheet.onRemoveStagedItem(item.productId)}
      />
    ),
    [
      sheet.onDecreaseStagedQuantity,
      sheet.onIncreaseStagedQuantity,
      sheet.onRemoveStagedItem,
    ],
  );

  const listHeader =
    sheet.suggestions.length > 0 ? (
      <Text
        size="xs"
        className="mb-2 px-1 font-semibold uppercase tracking-wide text-typography-500">
        {draftCopy.addProductSheetSuggestions}
      </Text>
    ) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={sheet.onCancel}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RNPressable style={styles.overlay} onPress={sheet.onCancel}>
          <RNPressable style={styles.sheet} onPress={() => {}}>
            <HStack className="mb-3 items-center justify-between">
              <Text size="lg" className="font-bold text-typography-900">
                {draftCopy.addProductSheetTitle}
              </Text>
              <Pressable
                onPress={sheet.onCancel}
                accessibilityRole="button"
                accessibilityLabel={draftCopy.addProductSheetCancel}
                style={styles.closeButton}>
                <X color={lightTokens.typography500} size={20} />
              </Pressable>
            </HStack>

            <TextInput
              value={sheet.searchQuery}
              onChangeText={sheet.onChangeSearchQuery}
              placeholder={draftCopy.addProductSheetSearchPlaceholder}
              placeholderTextColor={lightTokens.typography500}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />

            {sheet.stagedItems.length > 0 ? (
              <VStack space="xs" className="mt-3">
                <Text size="xs" className="font-semibold text-typography-500">
                  {draftCopy.addProductSheetStagedSection} ({sheet.stagedItems.length})
                </Text>
                <FlatList
                  data={sheet.stagedItems}
                  keyExtractor={item => item.productId}
                  renderItem={renderStagedItem}
                  scrollEnabled={sheet.stagedItems.length > 2}
                  style={styles.stagedList}
                  showsVerticalScrollIndicator={false}
                />
              </VStack>
            ) : null}

            <View style={styles.suggestionsContainer}>
              {sheet.isLoading ? (
                <Box style={styles.loadingBox}>
                  <ActivityIndicator color={lightTokens.tertiary600} />
                </Box>
              ) : sheet.loadError ? (
                <Text size="sm" className="py-4 text-center text-error-500">
                  {sheet.loadError}
                </Text>
              ) : sheet.suggestions.length === 0 ? (
                <Text size="sm" className="py-4 text-center text-typography-500">
                  {draftCopy.addProductSheetEmpty}
                </Text>
              ) : (
                <FlatList
                  data={sheet.suggestions}
                  keyExtractor={item => String(item.suggestion.id)}
                  renderItem={renderSuggestionItem}
                  ListHeaderComponent={listHeader}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
              )}
            </View>

            <HStack className="mt-3 gap-3">
              <Button
                variant="outline"
                action="secondary"
                className="flex-1"
                onPress={sheet.onCancel}>
                <ButtonText>{draftCopy.addProductSheetCancel}</ButtonText>
              </Button>
              <Button
                variant="solid"
                action="primary"
                className="flex-1"
                isDisabled={!sheet.canComplete}
                onPress={sheet.onComplete}>
                <ButtonText>{draftCopy.addProductSheetDone}</ButtonText>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    backgroundColor: lightTokens.background0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background50,
  },
  searchInput: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    color: lightTokens.typography900,
    fontSize: 16,
  },
  suggestionsContainer: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 160,
    marginTop: 12,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  listContent: {
    paddingBottom: 8,
  },
  stagedList: {
    maxHeight: 140,
  },
  suggestionRow: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  stagedRow: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  thumbnailWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    overflow: 'hidden',
    ...productThumbnailContainerStyle,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const AddDraftProductSheet = memo(AddDraftProductSheetComponent);
