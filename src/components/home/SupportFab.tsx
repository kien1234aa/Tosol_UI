import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Headphones } from 'lucide-react-native';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { usePressScale } from '@/src/hooks';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';

interface SupportFabProps {
  onPress?: () => void;
}

const ICON_SIZE = 28;

function SupportFabComponent({ onPress }: SupportFabProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel="Hỗ trợ">
        <Center className="h-16 w-16 rounded-full bg-tertiary-500" style={styles.fab}>
          <Headphones color={lightTokens.typography0} size={ICON_SIZE} />
        </Center>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: mainLayout.fabBottomOffset,
  },
  fab: {
    shadowColor: lightTokens.typography900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

export const SupportFab = memo(SupportFabComponent);
