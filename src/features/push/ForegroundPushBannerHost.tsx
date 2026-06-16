import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { RADIUS } from '@shared/theme/designTokens';
import {
  registerForegroundPushBannerHost,
  type ForegroundPushBannerPayload,
} from './foregroundPushBanner';

type BannerItem = ForegroundPushBannerPayload & { key: number };

export function ForegroundPushBannerHost({ children }: { children: ReactNode }) {
  const [banner, setBanner] = useState<BannerItem | null>(null);
  const keyRef = useRef(0);

  useEffect(() => {
    registerForegroundPushBannerHost(payload => {
      keyRef.current += 1;
      setBanner({ ...payload, key: keyRef.current });
    });
    return () => registerForegroundPushBannerHost(null);
  }, []);

  return (
    <>
      {children}
      {banner ? (
        <ForegroundPushBanner
          key={banner.key}
          item={banner}
          onDismiss={() => setBanner(null)}
        />
      ) : null}
    </>
  );
}

type ForegroundPushBannerProps = {
  item: BannerItem;
  onDismiss: () => void;
};

function ForegroundPushBanner({ item, onDismiss }: ForegroundPushBannerProps) {
  const c = useAppColors();
  const styles = useThemeStyleSheet(createStyles);
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-140)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateOut = useCallback(
    (after?: () => void) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -140,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
        after?.();
      });
    },
    [slideAnim, opacityAnim, onDismiss],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 18,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => animateOut(), item.duration ?? 5500);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [slideAnim, opacityAnim, item.duration, animateOut]);

  const handlePress = () => {
    animateOut(() => item.onPress?.());
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          top: insets.top + 8,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: c.bgCard,
            borderColor: c.border,
          },
        ]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${item.body}`}
      >
        <View style={[styles.iconWrap, { backgroundColor: c.cyanBg }]}>
          <Ionicons name="notifications" size={22} color={c.teal} />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.appLabel, { color: c.textMuted }]}>TOSOL</Text>
          <Text
            style={[styles.title, { color: c.textPrimary }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.body ? (
            <Text
              style={[styles.body, { color: c.textSecondary }]}
              numberOfLines={2}
            >
              {item.body}
            </Text>
          ) : null}
        </View>

        <Pressable
          hitSlop={8}
          onPress={() => animateOut()}
          accessibilityLabel="Đóng"
        >
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(c: AppColorPalette) {
  return StyleSheet.create({
    host: {
      position: 'absolute',
      left: 12,
      right: 12,
      zIndex: 100,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.14)',
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
      gap: 2,
    },
    appLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 20,
    },
    body: {
      fontSize: 13,
      lineHeight: 18,
    },
  });
}
