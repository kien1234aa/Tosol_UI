import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { profileCopy } from '@/src/configs/profile';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
} from '@/src/configs/theme/buttonLayout';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface ProfileLogoutButtonProps {
  onPress: () => void;
}

function ProfileLogoutButtonComponent({ onPress }: ProfileLogoutButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={profileCopy.logout}
      style={[buttonPrimaryCta, styles.button]}>
      <Text
        size="md"
        className="font-semibold text-typography-0"
        style={buttonLabelStyle}>
        {profileCopy.logout}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: lightTokens.error500,
  },
});

export const ProfileLogoutButton = memo(ProfileLogoutButtonComponent);
