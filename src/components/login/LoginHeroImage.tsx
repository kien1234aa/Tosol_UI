import React, { memo } from 'react';
import { AuthHeroImage } from './AuthHeroImage';

const heroSource = require('@/assets/images/mascot_login.png');

function LoginHeroImageComponent() {
  return <AuthHeroImage source={heroSource} alt="Login illustration" />;
}

export const LoginHeroImage = memo(LoginHeroImageComponent);
