import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Camera, Images } from 'lucide-react-native';
import { productsCopy } from '@/src/configs/products';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
import type { CreateProductImagePart } from '@/src/types/products';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface CreateProductImageFieldProps {
  image: CreateProductImagePart | null;
  /** Ảnh hiện tại từ server — hiển thị khi chưa chọn ảnh mới. */
  existingImageUrl?: string | null;
  disabled?: boolean;
  onPickFromLibrary: () => void;
  onPickFromCamera: () => void;
  onRemoveImage: () => void;
}

function CreateProductImageFieldComponent({
  image,
  existingImageUrl = null,
  disabled = false,
  onPickFromLibrary,
  onPickFromCamera,
  onRemoveImage,
}: CreateProductImageFieldProps) {
  const previewUri = image?.uri ?? existingImageUrl;
  const hasNewImage = image != null;
  const isEditMode = existingImageUrl != null && existingImageUrl !== '';
  const hint = isEditMode
    ? productsCopy.productImageHintEdit
    : productsCopy.productImageHint;
  const removeLabel =
    hasNewImage && isEditMode
      ? productsCopy.removeNewImage
      : productsCopy.removeImage;

  return (
    <VStack space="sm">
      <Text size="sm" className="font-medium text-typography-700">
        {productsCopy.productImageLabel}
      </Text>

      {previewUri ? (
        <VStack space="sm">
          <Image
            source={{ uri: previewUri }}
            style={styles.previewLarge}
            resizeMode="cover"
          />
          <HStack className="gap-3">
            <Pressable
              onPress={onPickFromCamera}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={productsCopy.pickFromCamera}
              style={[styles.pickButton, disabled ? styles.disabled : undefined]}>
              <HStack className="items-center justify-center gap-2">
                <Camera color={lightTokens.tertiary600} size={18} />
                <Text size="sm" className="font-medium text-tertiary-700">
                  {productsCopy.pickFromCamera}
                </Text>
              </HStack>
            </Pressable>
            <Pressable
              onPress={onPickFromLibrary}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={productsCopy.pickFromLibrary}
              style={[styles.pickButton, disabled ? styles.disabled : undefined]}>
              <HStack className="items-center justify-center gap-2">
                <Images color={lightTokens.tertiary600} size={18} />
                <Text size="sm" className="font-medium text-tertiary-700">
                  {productsCopy.pickFromLibrary}
                </Text>
              </HStack>
            </Pressable>
          </HStack>
          {hasNewImage ? (
            <Pressable
              onPress={onRemoveImage}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={removeLabel}>
              <Text size="sm" className="font-semibold text-error-500">
                {removeLabel}
              </Text>
            </Pressable>
          ) : null}
        </VStack>
      ) : (
        <VStack space="sm">
          <Pressable
            onPress={onPickFromCamera}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={productsCopy.pickFromCamera}
            style={[
              styles.primaryPickButton,
              disabled ? styles.disabled : undefined,
            ]}>
            <HStack className="items-center justify-center gap-2">
              <Camera color={lightTokens.tertiary600} size={20} />
              <Text size="md" className="font-semibold text-tertiary-700">
                {productsCopy.pickFromCamera}
              </Text>
            </HStack>
          </Pressable>
          <Pressable
            onPress={onPickFromLibrary}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={productsCopy.pickFromLibrary}
            style={[styles.pickButton, disabled ? styles.disabled : undefined]}>
            <HStack className="items-center justify-center gap-2">
              <Images color={lightTokens.tertiary600} size={18} />
              <Text size="sm" className="font-medium text-tertiary-700">
                {productsCopy.pickFromLibrary}
              </Text>
            </HStack>
          </Pressable>
        </VStack>
      )}

      <Text size="xs" className="text-typography-500">
        {hint}
      </Text>
    </VStack>
  );
}

const styles = StyleSheet.create({
  pickButton: {
    ...buttonContentCenter,
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  primaryPickButton: {
    ...buttonContentCenter,
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary200,
  },
  disabled: {
    opacity: 0.65,
  },
  previewLarge: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const CreateProductImageField = memo(CreateProductImageFieldComponent);
