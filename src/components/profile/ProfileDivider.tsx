import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';

function ProfileDividerComponent() {
  return <Box style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
  },
});

export const ProfileDivider = memo(ProfileDividerComponent);
