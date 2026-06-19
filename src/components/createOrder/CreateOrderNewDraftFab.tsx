import React, { memo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { draftCopy } from '@/src/configs/createOrder';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
import { usePressScale } from '@/src/hooks';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

const FAB_BOTTOM_OFFSET = 8;
const FAB_HEIGHT = 52;

interface CreateOrderNewDraftFabProps {
  onPress: () => void;
}

function CreateOrderNewDraftFabComponent({ onPress }: CreateOrderNewDraftFabProps) {
  const { horizontalPadding } = useResponsiveLayout();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: FAB_BOTTOM_OFFSET,
          right: horizontalPadding,
        },
        animatedStyle,
      ]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={draftCopy.createNewDraft}
        style={styles.fab}>
        <HStack className="items-center gap-2">
          <Plus color={lightTokens.typography0} size={22} strokeWidth={2.5} />
          <Text size="sm" className="font-semibold text-typography-0">
            {draftCopy.createNewDraft}
          </Text>
        </HStack>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
  },
  fab: {
    ...buttonContentCenter,
    minHeight: FAB_HEIGHT,
    paddingHorizontal: 20,
    borderRadius: FAB_HEIGHT / 2,
    backgroundColor: lightTokens.tertiary500,
    ...Platform.select({
      android: {
        elevation: 6,
      },
      default: {
        shadowColor: lightTokens.tertiary600,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
    }),
  },
});

export const CreateOrderNewDraftFab = memo(CreateOrderNewDraftFabComponent);
