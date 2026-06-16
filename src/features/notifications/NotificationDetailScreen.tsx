import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { formSectionCard } from '@shared/theme/surfaceStyles';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { CANVAS_SCREEN_PAD_H, RADIUS } from '@shared/theme/designTokens';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SalesMainStackParamList } from '../sales/navigation/salesNavigationRef';

function formatDetailDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const loc = locale === 'vi' ? 'vi-VN' : locale === 'ja' ? 'ja-JP' : 'en-GB';
  return d.toLocaleString(loc, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationDetailScreen() {
  const { t, i18n } = useTranslation();
  const palette = useAppColors();
  const { mode } = useThemeMode();
  const styles = useThemeStyleSheet(createStyles);
  const sectionSurface = formSectionCard(palette, mode);
  const insets = useSafeAreaInsets();
  const { params } =
    useRoute<RouteProp<SalesMainStackParamList, 'NotificationDetail'>>();

  const sentLabel = useMemo(
    () => formatDetailDate(params.created_at, i18n.language),
    [params.created_at, i18n.language],
  );

  const metaLines = useMemo(() => {
    const rows: { label: string; value: string }[] = [];
    if (params.type_label?.trim()) {
      rows.push({
        label: t('notifications.detailType'),
        value: params.type_label.trim(),
      });
    }
    if (params.category?.trim()) {
      rows.push({
        label: t('notifications.detailCategory'),
        value: params.category.trim(),
      });
    }
    if (params.severity?.trim()) {
      rows.push({
        label: t('notifications.detailSeverity'),
        value: params.severity.trim(),
      });
    }
    if (params.type?.trim()) {
      rows.push({
        label: t('notifications.detailInternalType'),
        value: params.type.trim(),
      });
    }
    if (params.action_url?.trim()) {
      rows.push({
        label: t('notifications.detailActionUrl'),
        value: params.action_url.trim(),
      });
    }
    rows.push({
      label: t('notifications.detailReadState'),
      value: params.is_read
        ? t('notifications.detailReadYes')
        : t('notifications.detailReadNo'),
    });
    return rows;
  }, [params, t]);

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top, borderBottomColor: palette.border },
        ]}
      >
        <View style={styles.backBtn} />
        <Text
          style={[styles.screenTitle, { color: palette.textPrimary }]}
          numberOfLines={1}
        >
          {t('notifications.detailTitle')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[ canvasListScrollContent(),
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator
      >
        <CanvasDetailHeroCard
          title={params.title}
          subtitle={
            sentLabel
              ? t('notifications.detailSentAt', { date: sentLabel })
              : undefined
          }
          healthLabel={t('notifications.detailReadState')}
          healthValue={
            params.is_read
              ? t('notifications.detailReadYes')
              : t('notifications.detailReadNo')
          }
        />

        {metaLines.length > 0 ? (
          <View style={[styles.metaCard, sectionSurface]}>
            {metaLines.map(row => (
              <View key={row.label} style={styles.metaRow}>
                <Text style={[styles.metaLab, { color: palette.textMuted }]}>
                  {row.label}
                </Text>
                <Text
                  style={[styles.metaVal, { color: palette.textSecondary }]}
                  selectable
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>
          {t('notifications.detailSectionMessage')}
        </Text>
        <View style={[styles.messageCard, sectionSurface]}>
          <Text
            style={[styles.messageBody, { color: palette.textPrimary }]}
            selectable
          >
            {params.message}
          </Text>
        </View>

        {params.dataJson != null && params.dataJson.trim() !== '' ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                styles.sectionSpaced,
                { color: palette.textSecondary },
              ]}
            >
              {t('notifications.detailSectionData')}
            </Text>
            <View style={[styles.dataCard, sectionSurface]}>
              <Text
                style={[styles.dataPre, { color: palette.textPrimary }]}
                selectable
              >
                {params.dataJson}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function createStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    screenTitle: {
      fontSize: 17,
      fontWeight: '800',
      flex: 1,
      textAlign: 'center',
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: CANVAS_SCREEN_PAD_H,
      paddingTop: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 28,
    },
    sentAt: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '600',
    },
    metaCard: {
      marginTop: 12,
      padding: 12,
      gap: 10,
    },
    metaRow: { gap: 4 },
    metaLab: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    metaVal: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    sectionTitle: {
      marginTop: 20,
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    sectionSpaced: { marginTop: 24 },
    messageCard: {
      marginTop: 8,
      padding: 14,
    },
    messageBody: {
      fontSize: 15,
      lineHeight: 24,
      fontWeight: '500',
    },
    dataCard: {
      marginTop: 8,
      padding: 12,
    },
    dataPre: {
      fontSize: 12,
      lineHeight: 18,
      fontFamily: 'monospace',
    },
  });
}
