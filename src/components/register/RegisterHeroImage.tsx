import React, { memo } from 'react';
import { AuthHeroImage } from '@/src/components/login/AuthHeroImage';

const heroSource = require('@/assets/images/mascot_register.png');

function RegisterHeroImageComponent() {
  return <AuthHeroImage source={heroSource} alt="Register illustration" />;
}

export const RegisterHeroImage = memo(RegisterHeroImageComponent);
