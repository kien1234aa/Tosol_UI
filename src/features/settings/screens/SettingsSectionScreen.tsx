import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';

export type SettingsSectionScreenProps = {
  onOpenDrawer: () => void;
  title: string;
  hint?: string;
};

const DEFAULT_HINT =
  'Nội dung sẽ được bổ sung khi tích hợp API. Bạn có thể quay lại menu để chọn mục khác.';

export function SettingsSectionScreen({
  onOpenDrawer,
  title,
  hint = DEFAULT_HINT,
}: SettingsSectionScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.shell}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[ canvasListScrollContent(),
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.hint, { color: palette.textSecondary }]}>
          {hint}
        </Text>
      </ScrollView>
    </View>
  );
}

function create_styles(p: AppColorPalette) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: p.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: p.textPrimary,
      marginBottom: 12,
    },
    hint: {
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
