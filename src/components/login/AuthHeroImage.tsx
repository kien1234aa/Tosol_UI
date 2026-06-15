import React, { memo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image } from '@/src/uikits/image';

interface AuthHeroImageProps {
  source: ImageSourcePropType;
  alt: string;
  className?: string;
}

function AuthHeroImageComponent({
  source,
  alt,
  className = 'w-[300px] h-[288px]',
}: AuthHeroImageProps) {
  return (
    <Image
      source={source}
      alt={alt}
      size="none"
      resizeMode="contain"
      className={className}
    />
  );
}

export const AuthHeroImage = memo(AuthHeroImageComponent);
