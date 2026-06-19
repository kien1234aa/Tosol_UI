import React, { memo, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  type ImageResizeMode,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

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
