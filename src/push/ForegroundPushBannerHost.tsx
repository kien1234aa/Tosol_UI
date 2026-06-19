import React, { memo, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import {
  setForegroundPushBannerListener,
  type ForegroundPushBannerPayload,
} from './foregroundPushBanner';

interface ForegroundPushBannerProps {
  payload: ForegroundPushBannerPayload;
  onDismiss: () => void;
}

function ForegroundPushBannerComponent({
  payload,
  onDismiss,
}: ForegroundPushBannerProps) {
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(() => {
    payload.onPress?.();
    onDismiss();
  }, [onDismiss, payload]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      style={[styles.container, { top: insets.top + 8 }]}>
      <Box style={styles.card}>
        <HStack className="items-start gap-3">
          <Box style={styles.iconWrap}>
            <Bell color={lightTokens.tertiary600} size={18} />
          </Box>
          <VStack className="flex-1" space="xs">
            <Text size="sm" className="font-semibold text-typography-900">
              {payload.title}
            </Text>
            {payload.body ? (
              <Text size="xs" className="text-typography-600" numberOfLines={3}>
                {payload.body}
              </Text>
            ) : null}
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    boxShadow: '0px 4px 12px rgba(22, 30, 36, 0.12)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.tertiary50,
  },
});

const ForegroundPushBanner = memo(ForegroundPushBannerComponent);

interface ForegroundPushBannerHostProps {
  children: React.ReactNode;
}

function ForegroundPushBannerHostComponent({
  children,
}: ForegroundPushBannerHostProps) {
  const [payload, setPayload] = useState<ForegroundPushBannerPayload | null>(
    null,
  );

  useEffect(() => {
    setForegroundPushBannerListener(next => {
      setPayload(next);
    });

    return () => {
      setForegroundPushBannerListener(null);
    };
  }, []);

  useEffect(() => {
    if (!payload) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setPayload(null);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [payload]);

  const handleDismiss = useCallback(() => {
    setPayload(null);
  }, []);

  return (
    <>
      {children}
      {payload ? (
        <ForegroundPushBanner payload={payload} onDismiss={handleDismiss} />
      ) : null}
    </>
  );
}

export const ForegroundPushBannerHost = memo(ForegroundPushBannerHostComponent);
