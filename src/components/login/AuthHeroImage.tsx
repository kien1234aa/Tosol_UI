import React, { memo } from 'react';
import { View, type ImageSourcePropType } from 'react-native';
import { Image } from '@/src/uikits/image';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';

interface AuthHeroImageProps {
  source: ImageSourcePropType;
  alt: string;
}

function AuthHeroImageComponent({ source, alt }: AuthHeroImageProps) {
  const { width, scale } = useResponsiveLayout();
  const imageWidth = Math.min(scale(300), width * 0.78);
  const imageHeight = imageWidth * 0.96;

  return (
    <View style={{ width: imageWidth, height: imageHeight }}>
      <Image
        source={source}
        alt={alt}
        size="full"
        resizeMode="contain"
      />
    </View>
  );
}

export const AuthHeroImage = memo(AuthHeroImageComponent);
