import React, { memo } from 'react';
import { AuthHeroImage } from '@/src/components/login/AuthHeroImage';

const heroSource = require('@/assets/images/mascot_forgot_password.png');

function ForgotPasswordHeroImageComponent() {
  return (
    <AuthHeroImage source={heroSource} alt="Forgot password illustration" />
  );
}

export const ForgotPasswordHeroImage = memo(ForgotPasswordHeroImageComponent);
