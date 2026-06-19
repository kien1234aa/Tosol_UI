import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { lightTokens } from '@/src/configs/theme';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';

interface ActionIconButtonProps {
  label: string;
  icon: LucideIcon;
  badge?: number;
  onPress?: () => void;
}

function ActionIconButtonComponent({
  label,
  icon: Icon,
  badge,
  onPress,
}: ActionIconButtonProps) {
  const { scale } = useResponsiveLayout();
  const iconSize = scale(26);
  const iconWrapSize = scale(44);
  const badgeSize = scale(18);
  const showBadge = typeof badge === 'number' && badge > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-full">
      <VStack className="items-center" space="xs">
        <Box
          style={[
            styles.iconWrap,
            { width: iconWrapSize, height: iconWrapSize },
          ]}>
          <Icon color={lightTokens.typography900} size={iconSize} />
          {showBadge ? (
            <Box
              style={[
                styles.badge,
                {
                  minWidth: badgeSize,
                  height: badgeSize,
                  borderRadius: badgeSize / 2,
                },
              ]}>
              <Text size="2xs" className="font-bold text-typography-0">
                {badge > 99 ? '99+' : String(badge)}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Text
          size="xs"
          className="text-center text-typography-500"
          numberOfLines={2}
          style={styles.label}>
          {label}
        </Text>
      </VStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    width: '100%',
    paddingHorizontal: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    left: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.error500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
});

export const ActionIconButton = memo(ActionIconButtonComponent);
