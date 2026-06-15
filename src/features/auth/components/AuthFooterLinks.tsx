import React, { memo } from 'react';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { authCopy } from '@/src/core/constants';

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
