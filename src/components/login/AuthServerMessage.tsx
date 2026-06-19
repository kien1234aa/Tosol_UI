import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';

interface AuthServerMessageProps {
  message: string;
}

function AuthServerMessageComponent({ message }: AuthServerMessageProps) {
  return (
    <HStack
      className="w-full items-start gap-2 rounded-xl px-3 py-2.5"
      style={styles.container}>
      <AlertCircle color={lightTokens.error500} size={18} />
      <Text size="sm" className="flex-1 text-error-500">
        {message}
      </Text>
    </HStack>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(230, 53, 53, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(230, 53, 53, 0.25)',
  },
});

export const AuthServerMessage = memo(AuthServerMessageComponent);
