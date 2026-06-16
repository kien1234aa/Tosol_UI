import React from 'react';
import { Image, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../../theme/useThemeStyleSheet';
import { LIST_CARD, RADIUS } from '../../../theme/designTokens';
import type { AppColorPalette } from '../../../theme/colorPalettes';
import { StyleSheet } from 'react-native';

export type ListCardThumbProps = {
  uri?: string | null;
  icon?: SystemIconName;
  imageResizeMode?: 'cover' | 'contain';
};

export function ListCardThumb({
  uri,
  icon = 'cube',
  imageResizeMode = 'cover',
}: ListCardThumbProps) {
  const c = useAppColors();
  const styles = useThemeStyleSheet(createListCardThumbStyles);
  const trimmed = (uri ?? '').trim();

  return (
    <View style={[styles.wrap, { borderColor: c.border, backgroundColor: c.bgInput }]}>
      {trimmed.length > 0 ? (
        <Image
          source={{ uri: trimmed }}
          style={styles.img}
          resizeMode={imageResizeMode}
        />
      ) : (
        <SystemIcon name={icon} size={16} color={c.textMuted} />
      )}
    </View>
  );
}

function createListCardThumbStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      width: LIST_CARD.thumbSize,
      height: LIST_CARD.thumbSize,
      borderRadius: RADIUS.sm,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    img: {
      width: '100%',
      height: '100%',
    },
  });
}
