import React, { memo } from 'react';
import { AuthHeroImage } from '@/src/components/login/AuthHeroImage';

const heroSource = require('@/assets/images/mascot_register.png');

interface RegisterHeroImageProps {
  className?: string;
}

function RegisterHeroImageComponent({
  className,
}: RegisterHeroImageProps) {
  return (
    <AuthHeroImage
      source={heroSource}
      alt="Register illustration"
      className={className}
    />
  );
}

export const RegisterHeroImage = memo(RegisterHeroImageComponent);
