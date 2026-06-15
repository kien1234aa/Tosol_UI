import React, { memo } from 'react';
import { Image } from '@/components/ui/image';

const mascotSource = require('@/assets/images/login-mascot-character.png');

interface BrandMascotProps {
  /** Tailwind width/height utility, kept overridable for tablets. */
  className?: string;
}

/**
 * Brand mascot illustration. Sized via className because the Gluestack
 * Image drops inline styles on native.
 */
function BrandMascotComponent({
  className = 'w-[240px] h-[230px]',
}: BrandMascotProps) {
  return (
    <Image
      source={mascotSource}
      alt="Tosol mascot"
      size="none"
      resizeMode="contain"
      className={className}
    />
  );
}

export const BrandMascot = memo(BrandMascotComponent);
