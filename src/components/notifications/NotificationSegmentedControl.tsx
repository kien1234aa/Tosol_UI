import React, { memo, useCallback, useEffect } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Megaphone, User } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import type { NotificationFilter } from '@/src/types/notifications/notifications.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface NotificationFilterOption {
  key: string;
  label: string;
}

interface NotificationSegmentedControlProps {
  options: NotificationFilterOption[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

const SEGMENT_ICONS: Record<
  NotificationFilter,
  typeof User
> = {
  personal: User,
  system: Megaphone,
};

const TRACK_PADDING = 4;
const SEGMENT_ANIMATION_MS = 220;
const ICON_SIZE = 16;

function NotificationSegmentedControlComponent({
  options,
  activeFilter,
  onSelectFilter,
}: NotificationSegmentedControlProps) {
  const translateX = useSharedValue(0);
  const segmentWidth = useSharedValue(0);

  const activeIndex = Math.max(
    0,
    options.findIndex(option => option.key === activeFilter),
  );

  useEffect(() => {
    translateX.value = withTiming(activeIndex * segmentWidth.value, {
      duration: SEGMENT_ANIMATION_MS,
    });
  }, [activeIndex, segmentWidth, translateX]);

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const trackWidth = event.nativeEvent.layout.width;
      const nextSegmentWidth = (trackWidth - TRACK_PADDING * 2) / options.length;
      segmentWidth.value = nextSegmentWidth;
      translateX.value = activeIndex * nextSegmentWidth;
    },
    [activeIndex, options.length, segmentWidth, translateX],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Box style={styles.track} onLayout={handleTrackLayout}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      <HStack className="w-full">
        {options.map(option => {
          const isActive = option.key === activeFilter;
          const Icon =
            SEGMENT_ICONS[option.key as NotificationFilter] ?? User;

          return (
            <Pressable
              key={option.key}
              onPress={() => onSelectFilter(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={option.label}
              style={styles.segment}>
              <HStack className="items-center justify-center gap-2">
                <Icon
                  color={
                    isActive
                      ? lightTokens.tertiary600
                      : lightTokens.typography500
                  }
                  size={ICON_SIZE}
                  strokeWidth={2.2}
                />
                <Text
                  size="sm"
                  className="font-semibold"
                  numberOfLines={1}
                  style={
                    isActive ? styles.labelActive : styles.labelInactive
                  }>
                  {option.label}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 999,
    padding: TRACK_PADDING,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: 999,
    backgroundColor: lightTokens.tertiary100,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  labelActive: {
    color: lightTokens.tertiary600,
  },
  labelInactive: {
    color: lightTokens.typography500,
  },
});

export const NotificationSegmentedControl = memo(
  NotificationSegmentedControlComponent,
);
