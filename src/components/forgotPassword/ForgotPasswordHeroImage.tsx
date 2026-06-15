import React, { memo } from 'react';
import { AuthHeroImage } from '@/src/components/login/AuthHeroImage';

const heroSource = require('@/assets/images/mascot_forgot_password.png');

interface ForgotPasswordHeroImageProps {
  className?: string;
}

function ForgotPasswordHeroImageComponent({
  className,
}: ForgotPasswordHeroImageProps) {
  return (
    <AuthHeroImage
      source={heroSource}
      alt="Forgot password illustration"
      className={className}
    />
  );
}

export const ForgotPasswordHeroImage = memo(ForgotPasswordHeroImageComponent);
