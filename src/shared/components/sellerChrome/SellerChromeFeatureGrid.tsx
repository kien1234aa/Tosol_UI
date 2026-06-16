import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SystemIcon } from '../icons/SystemIcon';
import type { SystemIconName } from '../icons/SystemIcon';
import { useAppColors } from '../../theme/ThemeContext';
import { useSellerChromeStyles } from './useSellerChromeStyles';

export type SellerChromeFeature = {
  id: string;
  label: string;
  hint: string;
  icon: SystemIconName;
};

export type SellerChromeFeatureGridProps = {
  features: SellerChromeFeature[];
  columns?: 2 | 3;
  onPressFeature?: (feature: SellerChromeFeature) => void;
};

export function SellerChromeFeatureGrid({
  features,
  columns = 2,
  onPressFeature,
}: SellerChromeFeatureGridProps) {
  const c = useAppColors();
  const s = useSellerChromeStyles();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: columns === 3 ? 8 : 10,
      }}
    >
      {features.map(f => (
        <Pressable
          key={f.id}
          style={[s.featureTile, columns === 3 && s.featureTile3]}
          onPress={() => onPressFeature?.(f)}
        >
          <View style={s.featureIconWrap}>
            <SystemIcon name={f.icon} size={22} color={c.teal} />
          </View>
          <Text style={s.featureLabel} numberOfLines={2}>
            {f.label}
          </Text>
          <Text style={s.featureHint} numberOfLines={2}>
            {f.hint}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
