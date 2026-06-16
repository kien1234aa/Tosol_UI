import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { tabBarLayout } from '@/src/configs/main';

const LOGO = require('@/assets/images/logo.png');

type HomeTabLogoProps = {
  size?: number;
};

function HomeTabLogoComponent({ size = tabBarLayout.homeLogoSize }: HomeTabLogoProps) {
  return (
    <Image
      source={LOGO}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});

export const HomeTabLogo = memo(HomeTabLogoComponent);
