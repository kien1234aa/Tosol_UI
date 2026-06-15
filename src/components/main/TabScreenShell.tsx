import React, { memo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { lightTokens } from '@/src/configs/theme';

interface TabScreenShellProps {
  title: string;
  children?: ReactNode;
}

function TabScreenShellComponent({ title, children }: TabScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Center className="flex-1 bg-background-50 px-6">
        <VStack className="w-full items-center gap-4" space="md">
          <Text
            size="2xl"
            className="text-center font-semibold text-typography-900">
            {title}
          </Text>
          {children}
        </VStack>
      </Center>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightTokens.background50,
  },
});

export const TabScreenShell = memo(TabScreenShellComponent);
