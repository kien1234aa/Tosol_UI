import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ArrowLeftIcon, Icon } from '@/src/uikits/icon';
import { Pressable } from '@/src/uikits/pressable';

interface AuthBackButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

function AuthBackButtonComponent({
  onPress,
  accessibilityLabel = 'Quay lại',
}: AuthBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={styles.button}>
      <Icon as={ArrowLeftIcon} size="xl" className="text-typography-900" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});

export const AuthBackButton = memo(AuthBackButtonComponent);
