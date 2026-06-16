import React, { useCallback, useEffect, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
export type NumericStepperFieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  /** Gắn sau nhãn, ví dụ `(g)` / `(cm)`. */
  unitSuffix?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Bước mỗi lần bấm +/- (mặc định 1). */
  step?: number;
  /** Cho phép số thập phân (một dấu `.`). */
  allowDecimal?: boolean;
  editable?: boolean;
} & Pick<TextInputProps, 'keyboardType'>;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseNumber(raw: string, allowDecimal: boolean): number | null {
  const t = raw.trim();
  if (t === '' || t === '-') {
    return null;
  }
  if (allowDecimal) {
    const n = Number.parseFloat(t.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  const n = Number.parseInt(t.replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

export function NumericStepperField({
  label,
  required,
  hint,
  unitSuffix,
  value,
  onChange,
  min = 0,
  max = 999_999_999,
  step = 1,
  allowDecimal = false,
  editable = true,
  keyboardType = 'numeric',
}: NumericStepperFieldProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_NumericStepperField_styles);

  const [text, setText] = useState(() =>
    allowDecimal ? String(value) : String(Math.round(value)),
  );

  useEffect(() => {
    setText(allowDecimal ? String(value) : String(Math.round(value)));
  }, [value, allowDecimal]);

  const commitParsed = useCallback(
    (raw: string) => {
      const parsed = parseNumber(raw, allowDecimal);
      if (parsed == null) {
        setText(allowDecimal ? String(value) : String(Math.round(value)));
        return;
      }
      const rounded = allowDecimal ? parsed : Math.round(parsed);
      onChange(clamp(rounded, min, max));
    },
    [allowDecimal, max, min, onChange, value],
  );

  const bump = useCallback(
    (delta: number) => {
      const base = allowDecimal ? value : Math.round(value);
      const next = clamp(base + delta, min, max);
      onChange(next);
    },
    [allowDecimal, max, min, onChange, value],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {unitSuffix ? (
          <Text style={styles.unitSuffix}> {unitSuffix}</Text>
        ) : null}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={t => {
            if (!editable) {
              return;
            }
            if (allowDecimal) {
              const cleaned = t.replace(/[^\d.,-]/g, '').replace(',', '.');
              setText(cleaned);
              const p = parseNumber(cleaned, true);
              if (p != null) {
                onChange(clamp(p, min, max));
              }
              return;
            }
            const cleaned = t.replace(/\D/g, '');
            setText(cleaned);
            if (cleaned === '') {
              onChange(min);
              return;
            }
            const p = Number.parseInt(cleaned, 10);
            if (Number.isFinite(p)) {
              onChange(clamp(p, min, max));
            }
          }}
          onBlur={() => commitParsed(text)}
          keyboardType={keyboardType}
          placeholder="0"
          placeholderTextColor={palette.textMuted}
          editable={editable}
        />
        <View style={styles.stepCol}>
          <Pressable
            onPress={() => bump(step)}
            style={({ pressed }) => [
              styles.stepBtn,
              pressed && styles.stepBtnPressed,
            ]}
            hitSlop={4}
            accessibilityLabel="Tăng"
          >
            <Text style={styles.stepChev}>▲</Text>
          </Pressable>
          <Pressable
            onPress={() => bump(-step)}
            style={({ pressed }) => [
              styles.stepBtn,
              pressed && styles.stepBtnPressed,
            ]}
            hitSlop={4}
            accessibilityLabel="Giảm"
          >
            <Text style={styles.stepChev}>▼</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function create_NumericStepperField_styles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 14,
      minWidth: 0,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 4,
    },
    unitSuffix: {
      fontWeight: '600',
      color: c.textMuted,
    },
    req: {
      color: c.orange,
    },
    hint: {
      fontSize: 11,
      color: c.textMuted,
      marginBottom: 6,
      lineHeight: 15,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      overflow: 'hidden',
    },
    input: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 12,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    stepCol: {
      width: 40,
      borderLeftWidth: 1,
      borderLeftColor: c.border,
    },
    stepBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
    },
    stepBtnPressed: {
      backgroundColor: c.bgButton,
    },
    stepChev: {
      fontSize: 11,
      color: c.cyan,
      fontWeight: '800',
    },
  });
}
