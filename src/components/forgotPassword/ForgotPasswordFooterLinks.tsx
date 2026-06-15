import React, { memo } from 'react';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { forgotPasswordCopy } from '@/src/configs/forgotPassword';
import { lightTokens } from '@/src/configs/theme';

interface ForgotPasswordFooterLinksProps {
  onLogin: () => void;
}

function ForgotPasswordFooterLinksComponent({
  onLogin,
}: ForgotPasswordFooterLinksProps) {
  return (
    <VStack className="w-full items-center gap-4" space="md">
      <HStack className="items-center justify-center" space="xs">
        <Text className="text-typography-900">
          {forgotPasswordCopy.rememberPasswordPrompt}
        </Text>
        <Pressable onPress={onLogin} accessibilityRole="button">
          <Text
            className="font-semibold"
            style={{ color: lightTokens.tertiary500 }}>
            {forgotPasswordCopy.loginCta}
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
}

export const ForgotPasswordFooterLinks = memo(ForgotPasswordFooterLinksComponent);
