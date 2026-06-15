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
    borderWidth: 1,
    borderColor: lightTokens.outline100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
});

export const ProfileSectionCard = memo(ProfileSectionCardComponent);
