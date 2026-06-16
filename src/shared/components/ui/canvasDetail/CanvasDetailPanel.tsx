import React from 'react';
import { Text, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import { useCanvasDetailStyles } from './canvasDetailTheme';

export type CanvasDetailPanelProps = {
  title: string;
  children: React.ReactNode;
  icon?: SystemIconName;
};

/** Thẻ panel tab chi tiết (viền trái teal) — thay `DetailCard` cũ. */
export function CanvasDetailPanel({ title, children, icon }: CanvasDetailPanelProps) {
  const canvas = useCanvasDetailStyles();
  const c = useAppColors();

  return (
    <View style={[canvas.screenPad, canvas.blockGap]}>
      <View style={canvas.panelCard}>
        <View style={canvas.panelTitleRow}>
          {icon ? <SystemIcon name={icon} size={18} color={c.teal} /> : null}
          <Text style={canvas.panelTitle}>{title}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

export type CanvasDetailRowProps = {
  label: string;
  value: string;
  last?: boolean;
};

export function CanvasDetailRow({ label, value, last }: CanvasDetailRowProps) {
  const canvas = useCanvasDetailStyles();

  return (
    <View style={[canvas.detailRow, last && canvas.detailRowLast]}>
      <Text style={canvas.detailLab}>{label}</Text>
      <Text style={canvas.detailVal}>{value}</Text>
    </View>
  );
}

/** @deprecated Dùng `CanvasDetailPanel`. */
export const DetailCard = CanvasDetailPanel;

/** @deprecated Dùng `CanvasDetailRow`. */
export const DetailRow = CanvasDetailRow;
