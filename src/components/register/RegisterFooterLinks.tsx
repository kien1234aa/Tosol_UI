import React, { memo } from 'react';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { registerCopy } from '@/src/configs/register';
import { lightTokens } from '@/src/configs/theme';

interface RegisterFooterLinksProps {
  onLogin: () => void;
}

function RegisterFooterLinksComponent({ onLogin }: RegisterFooterLinksProps) {
  return (
    <VStack className="w-full items-center gap-4" space="md">
      <HStack className="items-center justify-center" space="xs">
        <Text className="text-typography-900">
          {registerCopy.hasAccountPrompt}
        </Text>
        <Pressable onPress={onLogin} accessibilityRole="button">
          <Text
            className="font-semibold"
            style={{ color: lightTokens.tertiary500 }}>
            {registerCopy.loginCta}
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
}

export const RegisterFooterLinks = memo(RegisterFooterLinksComponent);
