import React from 'react';
import { StyleSheet } from 'react-native';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { Button, ButtonText } from '@/src/uikits/button';
import { lightTokens } from '@/src/configs/theme';

export interface DetailHeroProps {
  title: string;
  subtitle?: string;
  metrics?: Array<{ label: string; value: string }>;
}

export function DetailHero({ title, subtitle, metrics = [] }: DetailHeroProps) {
  return (
    <VStack className="gap-3 rounded-2xl bg-background-50 p-4">
      <Text size="xl" className="font-bold text-typography-900">
        {title}
      </Text>
      {subtitle ? (
        <Text size="sm" className="text-typography-600">
          {subtitle}
        </Text>
      ) : null}
      {metrics.length > 0 ? (
        <HStack className="flex-wrap gap-4 pt-2">
          {metrics.map(m => (
            <VStack key={m.label} className="gap-0.5">
              <Text size="xs" className="text-typography-500">
                {m.label}
              </Text>
              <Text size="md" className="font-semibold text-typography-900">
                {m.value}
              </Text>
            </VStack>
          ))}
        </HStack>
      ) : null}
    </VStack>
  );
}

export interface DetailActionBarProps {
  primaryLabel: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export function DetailActionBar({
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: DetailActionBarProps) {
  return (
    <HStack className="gap-3 border-t border-secondary-200 bg-background-0 p-4">
      {secondaryLabel ? (
        <Button variant="outline" className="flex-1" onPress={onSecondaryPress}>
          <ButtonText>{secondaryLabel}</ButtonText>
        </Button>
      ) : null}
      <Button
        variant="solid"
        className="flex-1"
        style={styles.primary}
        onPress={onPrimaryPress}>
        <ButtonText className="text-typography-0">{primaryLabel}</ButtonText>
      </Button>
    </HStack>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: lightTokens.tertiary500,
  },
});
