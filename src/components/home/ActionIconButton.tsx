import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { lightTokens } from '@/src/configs/theme';

interface ActionIconButtonProps {
  label: string;
  icon: LucideIcon;
  badge?: number;
  onPress?: () => void;
}

const ICON_SIZE = 26;
const ICON_WRAP_SIZE = 44;

function ActionIconButtonComponent({
  label,
  icon: Icon,
  badge,
  onPress,
}: ActionIconButtonProps) {
  const showBadge = typeof badge === 'number' && badge > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-full">
      <VStack className="items-center" space="xs">
        <Box style={styles.iconWrap}>
          <Icon color={lightTokens.typography900} size={ICON_SIZE} />
          {showBadge ? (
            <Box style={styles.badge}>
              <Text size="2xs" className="font-bold text-typography-0">
                {badge > 99 ? '99+' : String(badge)}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Text
          size="xs"
          className="text-center text-typography-500"
          numberOfLines={2}>
          {label}
        </Text>
      </VStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: ICON_WRAP_SIZE,
    height: ICON_WRAP_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    left: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.error500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
});

export const ActionIconButton = memo(ActionIconButtonComponent);
