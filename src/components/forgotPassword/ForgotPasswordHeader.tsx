import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { fontStyle } from '@/src/configs/theme/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Icon, ArrowLeftIcon } from '@/src/uikits/icon';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface ForgotPasswordHeaderProps {
  title: string;
  onBack: () => void;
}

function ForgotPasswordHeaderComponent({
  title,
  onBack,
}: ForgotPasswordHeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Box className="bg-tertiary-50">
        <HStack className="h-14 items-center px-4">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            className="h-10 w-10 items-center justify-center">
            <Icon as={ArrowLeftIcon} size="xl" className="text-typography-900" />
          </Pressable>

          <Text
            size="lg"
            className="flex-1 text-center font-semibold text-typography-900"
            style={styles.title}>
            {title}
          </Text>

          <Box className="h-10 w-10" />
        </HStack>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgb(235, 245, 247)',
  },
  title: fontStyle('semibold'),
});

export const ForgotPasswordHeader = memo(ForgotPasswordHeaderComponent);
