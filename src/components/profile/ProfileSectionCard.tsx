import React, { memo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ProfileSectionCardProps {
  title: string;
  children: ReactNode;
}

function ProfileSectionCardComponent({
  title,
  children,
}: ProfileSectionCardProps) {
  return (
    <Box style={styles.card}>
      <VStack space="xs">
        <Text size="md" className="font-bold text-typography-900">
          {title}
        </Text>
        {children}
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const ProfileSectionCard = memo(ProfileSectionCardComponent);
