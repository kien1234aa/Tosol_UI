import React, { memo } from 'react';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { authCopy } from '@/src/configs';

interface AuthFooterLinksProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

function AuthFooterLinksComponent({
  onForgotPassword,
  onRegister,
}: AuthFooterLinksProps) {
  return (
    <VStack className="w-full items-center gap-4" space="md">
      <Pressable onPress={onForgotPassword} accessibilityRole="button">
        <Text className="text-typography-900">{authCopy.forgotPassword}</Text>
      </Pressable>

      <HStack className="items-center justify-center" space="xs">
        <Text className="text-typography-900">{authCopy.noAccountPrompt}</Text>
        <Pressable onPress={onRegister} accessibilityRole="button">
          <Text className="font-medium text-error-500">
            {authCopy.registerCta}
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
}

export const AuthFooterLinks = memo(AuthFooterLinksComponent);
