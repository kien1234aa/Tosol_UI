import React, { useMemo } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { DetailCard } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { purchaseOrderAttachmentToRow } from '@mappers/warehouse/purchaseOrderAttachmentMappers';
import type { PurchaseOrderAttachmentApi } from '@services/warehouse/purchaseOrderApiTypes';

export type PurchaseOrderDetailDocumentsPanelProps = {
  attachments?: PurchaseOrderAttachmentApi[] | null;
};

export function PurchaseOrderDetailDocumentsPanel({
  attachments = [],
}: PurchaseOrderDetailDocumentsPanelProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createPanelStyles);

  const rows = useMemo(
    () => (attachments ?? []).map(purchaseOrderAttachmentToRow),
    [attachments],
  );

  const openAttachment = async (url: string | null) => {
    if (!url) {
      toast.info('Không có liên kết tải chứng từ.');
      return;
    }
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        toast.error('Không mở được liên kết chứng từ.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      toast.error('Không mở được liên kết chứng từ.');
    }
  };

  return (
    <DetailCard title="Chứng từ" icon="paperclip">
      {rows.length > 0 ? (
        <Text style={styles.panelHint}>
          Tổng số tệp:{' '}
          <Text style={styles.panelHintStrong}>
            {rows.length.toLocaleString('vi-VN')}
          </Text>
        </Text>
      ) : null}

      {rows.length === 0 ? (
        <View style={styles.emptyInner}>
          <View style={styles.emptyIconSlot}>
            <SystemIcon name="paperclip" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có chứng từ</Text>
          <Text style={styles.emptyHint}>
            Tệp đính kèm của đơn mua hàng sẽ hiển thị tại đây.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {rows.map(row => (
            <Pressable
              key={String(row.id)}
              style={({ pressed }) => [
                styles.attachRow,
                pressed && row.url ? styles.attachRowPressed : null,
              ]}
              onPress={() => void openAttachment(row.url)}
              disabled={!row.url}
            >
              <View style={styles.attachIcon}>
                <SystemIcon name="document" size={18} color={palette.teal} />
              </View>
              <View style={styles.attachBody}>
                <Text style={styles.attachName} numberOfLines={2}>
                  {row.name}
                </Text>
                {row.metaLine ? (
                  <Text style={styles.attachMeta} numberOfLines={2}>
                    {row.metaLine}
                  </Text>
                ) : null}
                {row.createdAtDisplay ? (
                  <Text style={styles.attachDate} numberOfLines={1}>
                    {row.createdAtDisplay}
                  </Text>
                ) : null}
              </View>
              {row.url ? (
                <SystemIcon
                  name="chevronForward"
                  size={16}
                  color={palette.textMuted}
                />
              ) : null}
            </Pressable>
          ))}
        </View>
      )}
    </DetailCard>
  );
}

function createPanelStyles(c: AppColorPalette) {
  return StyleSheet.create({
    panelHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 19,
      marginBottom: 12,
    },
    panelHintStrong: { fontWeight: '800', color: c.textPrimary },
    emptyInner: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    emptyIconSlot: {
      marginBottom: 8,
      opacity: 0.45,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 6,
    },
    emptyHint: {
      fontSize: 12,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 17,
    },
    list: { gap: 8 },
    attachRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderMid,
      backgroundColor: c.bgInput,
    },
    attachRowPressed: { opacity: 0.92 },
    attachIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgCard,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    attachBody: { flex: 1, minWidth: 0, gap: 3 },
    attachName: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
      lineHeight: 19,
    },
    attachMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 17,
    },
    attachDate: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 15,
    },
  });
}
