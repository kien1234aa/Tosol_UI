import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppColors } from '../../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../../theme/useThemeStyleSheet';
import type { AppColorPalette } from '../../../theme/colorPalettes';
import { RADIUS } from '../../../theme/designTokens';
import {
  _registerFeedback,
  type ConfirmConfig,
  type ToastConfig,
  type ToastType,
} from './appFeedback';

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastItem = ToastConfig & { key: number };

type ToastColors = {
  bg: string;
  border: string;
  icon: string;
  text: string;
};

function toastColors(type: ToastType, c: AppColorPalette): ToastColors {
  switch (type) {
    case 'success':
      return { bg: c.greenBg, border: c.greenBorder, icon: c.green, text: c.textPrimary };
    case 'error':
      return { bg: c.redBg, border: c.redBorder, icon: c.red, text: c.textPrimary };
    case 'warning':
      return { bg: c.orangeBg, border: c.orangeBorder, icon: c.orange, text: c.textPrimary };
    case 'info':
      return { bg: c.cyanBg, border: c.teal, icon: c.teal, text: c.textPrimary };
    case 'notification':
      return {
        bg: c.bgCard,
        border: c.border,
        icon: c.teal,
        text: c.textPrimary,
      };
    default:
      return { bg: c.cyanBg, border: c.teal, icon: c.teal, text: c.textPrimary };
  }
}

function toastIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'close-circle';
    case 'warning':
      return 'warning';
    case 'notification':
      return 'notifications';
    case 'info':
    default:
      return 'information-circle';
  }
}

type ToastBannerProps = {
  item: ToastItem;
  onDismiss: () => void;
};

function ToastBanner({ item, onDismiss }: ToastBannerProps) {
  const c = useAppColors();
  const styles = useThemeStyleSheet(createToastStyles);
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateOut = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [slideAnim, opacityAnim, onDismiss]);

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 20,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    timerRef.current = setTimeout(animateOut, item.duration ?? 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slideAnim, opacityAnim, item.duration, animateOut]);

  const colors = toastColors(item.type, c);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: insets.top + 12,
          backgroundColor: c.bgCard,
          borderColor: colors.border,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        style={[
          styles.toastInner,
          item.type === 'notification'
            ? { backgroundColor: c.bgCard, alignItems: 'flex-start' }
            : { backgroundColor: colors.bg },
          item.title != null && item.type !== 'notification' && { alignItems: 'flex-start' },
          item.type === 'notification' && styles.toastInnerNotification,
        ]}
        onPress={animateOut}
      >
        <Ionicons name={toastIcon(item.type)} size={22} color={colors.icon} />
        <View style={styles.toastTextBlock}>
          {item.type === 'notification' ? (
            <Text style={[styles.toastAppLabel, { color: c.textMuted }]}>
              TOSOL
            </Text>
          ) : null}
          {item.title ? (
            <Text
              style={[styles.toastTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          ) : null}
          <Text
            style={[styles.toastMessage, { color: colors.text }]}
            numberOfLines={item.title ? 2 : 3}
          >
            {item.message}
          </Text>
        </View>
        <Ionicons name="close-outline" size={18} color={c.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

function createToastStyles(c: AppColorPalette) {
  return StyleSheet.create({
    toastContainer: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 50,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
      overflow: 'hidden',
    },
    toastInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    toastInnerNotification: {
      borderLeftWidth: 3,
      borderLeftColor: c.teal,
      paddingLeft: 12,
    },
    toastTextBlock: {
      flex: 1,
      gap: 2,
    },
    toastTitle: {
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 19,
    },
    toastAppLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    toastMessage: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 19,
    },
  });
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

type ConfirmState = ConfirmConfig & {
  resolve: (result: boolean) => void;
};

type ConfirmDialogViewProps = {
  state: ConfirmState;
};

function ConfirmDialogView({ state }: ConfirmDialogViewProps) {
  const c = useAppColors();
  const styles = useThemeStyleSheet(createConfirmStyles);
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 22,
        bounciness: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handleResolve = (result: boolean) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => state.resolve(result));
  };

  const confirmLabel = state.confirmText ?? 'Xác nhận';
  const cancelLabel = state.cancelText ?? 'Hủy';

  const confirmBg = state.destructive ? c.red : c.teal;
  const confirmTextColor = state.destructive ? '#ffffff' : '#2c2416';

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={() => handleResolve(false)}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => handleResolve(false)}
        />
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: c.bgModal, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: state.destructive ? c.redBg : c.cyanBg,
              },
            ]}
          >
            <Ionicons
              name={state.destructive ? 'warning' : 'information-circle'}
              size={28}
              color={state.destructive ? c.red : c.teal}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: c.textPrimary }]}>
            {state.title}
          </Text>

          {/* Message */}
          {state.message ? (
            <Text style={[styles.message, { color: c.textSecondary }]}>
              {state.message}
            </Text>
          ) : null}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.btnCancel,
                { backgroundColor: c.bgButton, borderColor: c.border },
              ]}
              onPress={() => handleResolve(false)}
            >
              <Text style={[styles.btnCancelText, { color: c.textSecondary }]}>
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.btnConfirm, { backgroundColor: confirmBg }]}
              onPress={() => handleResolve(true)}
            >
              <Text style={[styles.btnConfirmText, { color: confirmTextColor }]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function createConfirmStyles(c: AppColorPalette) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    card: {
      width: '100%',
      borderRadius: RADIUS.lg,
      paddingTop: 28,
      paddingBottom: 22,
      paddingHorizontal: 24,
      alignItems: 'center',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.16)',
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: -0.2,
    },
    message: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 4,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 22,
      width: '100%',
    },
    btnCancel: {
      flex: 1,
      height: 44,
      borderRadius: RADIUS.control,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnCancelText: {
      fontSize: 15,
      fontWeight: '600',
    },
    btnConfirm: {
      flex: 1,
      height: 44,
      borderRadius: RADIUS.control,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnConfirmText: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const toastKeyRef = useRef(0);

  const showToast = useCallback((config: ToastConfig) => {
    toastKeyRef.current += 1;
    setCurrentToast({ ...config, key: toastKeyRef.current });
  }, []);

  const showConfirm = useCallback((config: ConfirmConfig): Promise<boolean> => {
    return new Promise(resolve => {
      const wrappedResolve = (result: boolean) => {
        setConfirmState(null);
        resolve(result);
      };
      setConfirmState({ ...config, resolve: wrappedResolve });
    });
  }, []);

  useEffect(() => {
    _registerFeedback(showToast, showConfirm);
    return () => _registerFeedback(null, null);
  }, [showToast, showConfirm]);

  return (
    <>
      {children}
      {currentToast ? (
        <ToastBanner
          key={currentToast.key}
          item={currentToast}
          onDismiss={() => setCurrentToast(null)}
        />
      ) : null}
      {confirmState ? <ConfirmDialogView state={confirmState} /> : null}
    </>
  );
}
