import React, { memo } from 'react';
import { AuthHeroImage } from './AuthHeroImage';

const heroSource = require('@/assets/images/mascot_login.png');

interface LoginHeroImageProps {
  className?: string;
}

function LoginHeroImageComponent({
  className,
}: LoginHeroImageProps) {
  return (
    <AuthHeroImage
      source={heroSource}
      alt="Login illustration"
      className={className}
    />
  );
}

export const LoginHeroImage = memo(LoginHeroImageComponent);
