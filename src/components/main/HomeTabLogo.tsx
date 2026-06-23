import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { tabBarLayout } from '@/src/configs/main';

const LOGO = require('@/assets/images/logo.png');

type HomeTabLogoProps = {
  size?: number;
  /** Phủ kín vòng tròn bong bóng (tab Home đang active). */
  coverBubble?: boolean;
};

function HomeTabLogoComponent({
  size,
  coverBubble = false,
}: HomeTabLogoProps) {
  const resolvedSize =
    size ??
    (coverBubble ? tabBarLayout.bubbleSize : tabBarLayout.homeLogoSize);

  return (
    <Image
      source={LOGO}
      style={[
        styles.logo,
        {
          width: resolvedSize,
          height: resolvedSize,
          borderRadius: coverBubble ? resolvedSize / 2 : 0,
        },
      ]}
      resizeMode={coverBubble ? 'cover' : 'contain'}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});

export const HomeTabLogo = memo(HomeTabLogoComponent);
