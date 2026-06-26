import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { Center } from '@/src/uikits/center';
import { VStack } from '@/src/uikits/vstack';

const AVATAR_SIZE = 88;
const USER_ICON_SIZE = 40;

function PersonalInfoAvatarComponent() {
  return (
    <VStack className="items-center" space="sm">
      <Center style={styles.avatar}>
        <User color={lightTokens.tertiary500} size={USER_ICON_SIZE} />
      </Center>
    </VStack>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: lightTokens.background0,
    borderWidth: 2,
    borderColor: lightTokens.outline100,
  },
});

export const PersonalInfoAvatar = memo(PersonalInfoAvatarComponent);
