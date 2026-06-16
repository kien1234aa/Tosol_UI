import React, { memo, useCallback } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Camera, User } from 'lucide-react-native';
import { personalInfoCopy, profileCopy } from '@/src/configs/profile';
import { lightTokens } from '@/src/configs/theme';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

const AVATAR_SIZE = 88;
const USER_ICON_SIZE = 40;

function PersonalInfoAvatarComponent() {
  const handleChangeAvatar = useCallback(() => {
    Alert.alert(profileCopy.featureComingSoon);
  }, []);

  return (
    <VStack className="items-center" space="sm">
      <Center style={styles.avatar}>
        <User color={lightTokens.tertiary500} size={USER_ICON_SIZE} />
      </Center>
      <Pressable
        onPress={handleChangeAvatar}
        accessibilityRole="button"
        accessibilityLabel={personalInfoCopy.changeAvatar}
        style={styles.changeButton}>
        <Camera color={lightTokens.tertiary600} size={14} />
        <Text size="xs" className="font-medium text-tertiary-600">
          {personalInfoCopy.changeAvatar}
        </Text>
      </Pressable>
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
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const PersonalInfoAvatar = memo(PersonalInfoAvatarComponent);
