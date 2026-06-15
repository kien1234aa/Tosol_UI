import React, { memo, useCallback } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { Phone } from 'lucide-react-native';
import { profileCopy, profileSupportLinks } from '@/src/configs/profile';
import { lightTokens } from '@/src/configs/theme';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { ProfileDivider } from './ProfileDivider';
import { ProfileMenuRow } from './ProfileMenuRow';
import { ProfileSectionCard } from './ProfileSectionCard';

function ZaloIcon() {
  return (
    <Center style={styles.zaloBadge}>
      <Text size="xs" className="font-bold" style={styles.zaloText}>
        Z
      </Text>
    </Center>
  );
}

function ProfileSupportCardComponent() {
  const handleOpenZalo = useCallback(() => {
    Linking.openURL(`https://zalo.me/${profileSupportLinks.zaloPhone}`);
  }, []);

  const handleCallSupport = useCallback(() => {
    Linking.openURL(`tel:${profileSupportLinks.zaloPhone}`);
  }, []);

  return (
    <ProfileSectionCard title={profileCopy.supportSection}>
      <ProfileMenuRow
        label={profileCopy.supportStaffName}
        showChevron={false}
        trailing={
          <Pressable
            onPress={handleOpenZalo}
            accessibilityRole="button"
            accessibilityLabel={profileCopy.openZalo}
            style={styles.actionButton}>
            <ZaloIcon />
          </Pressable>
        }
      />
      <ProfileDivider />
      <ProfileMenuRow
        label={profileCopy.supportPhone}
        showChevron={false}
        trailing={
          <Pressable
            onPress={handleCallSupport}
            accessibilityRole="button"
            accessibilityLabel={profileCopy.callSupport}
            style={styles.actionButton}>
            <Phone color={lightTokens.typography900} size={18} />
          </Pressable>
        }
      />
    </ProfileSectionCard>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zaloBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#0068FF',
  },
  zaloText: {
    color: lightTokens.typography0,
  },
});

export const ProfileSupportCard = memo(ProfileSupportCardComponent);
