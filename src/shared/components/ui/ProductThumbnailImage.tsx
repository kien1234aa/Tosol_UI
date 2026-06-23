import React, { memo, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  type ImageResizeMode,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';

export const productPlaceholderSource = require('@/assets/images/product-placeholder.png');

/** Dùng cho wrapper ảnh sản phẩm để `cover` clip đúng góc bo. */
export const productThumbnailContainerStyle: ViewStyle = {
  overflow: 'hidden',
  position: 'relative',
};

export function resolveProductImageSource(
  uri?: string | null,
): ImageSourcePropType {
  if (uri) {
    return { uri };
  }

  return productPlaceholderSource;
}

interface ProductThumbnailImageProps {
  uri?: string | null;
  resizeMode?: ImageResizeMode;
  style?: StyleProp<ViewStyle>;
}

function ProductThumbnailImageComponent({
  uri,
  resizeMode = 'cover',
  style,
}: ProductThumbnailImageProps) {
  const source = useMemo(() => resolveProductImageSource(uri), [uri]);

  return (
    <Image
      source={source}
      style={[styles.image, style]}
      resizeMode={resizeMode}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});

export const ProductThumbnailImage = memo(ProductThumbnailImageComponent);

const QUANTITY_BADGE_SIZE = 22;
const QUANTITY_BADGE_OVERFLOW = 4;

interface ProductThumbnailWithQuantityBadgeProps {
  uri?: string | null;
  quantity: number;
  size?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

function ProductThumbnailWithQuantityBadgeComponent({
  uri,
  quantity,
  size = 64,
  borderRadius = 12,
  style,
}: ProductThumbnailWithQuantityBadgeProps) {
  return (
    <Box
      style={[
        quantityBadgeStyles.wrapper,
        {
          width: size + QUANTITY_BADGE_OVERFLOW,
          height: size + QUANTITY_BADGE_OVERFLOW,
        },
        style,
      ]}>
      <Box
        style={[
          quantityBadgeStyles.clip,
          { width: size, height: size, borderRadius },
        ]}>
        <ProductThumbnailImage uri={uri} />
      </Box>
      <Center style={quantityBadgeStyles.badge}>
        <Text size="xs" className="font-bold text-typography-0">
          {quantity}
        </Text>
      </Center>
    </Box>
  );
}

const quantityBadgeStyles = StyleSheet.create({
  wrapper: {
    flexShrink: 0,
    position: 'relative',
  },
  clip: {
    overflow: 'hidden',
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: QUANTITY_BADGE_SIZE,
    height: QUANTITY_BADGE_SIZE,
    borderRadius: QUANTITY_BADGE_SIZE / 2,
    paddingHorizontal: 4,
    backgroundColor: lightTokens.tertiary500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
});

export const ProductThumbnailWithQuantityBadge = memo(
  ProductThumbnailWithQuantityBadgeComponent,
);
