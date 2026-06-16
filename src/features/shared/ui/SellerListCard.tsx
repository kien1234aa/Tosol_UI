import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge';

export interface SellerListCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  statusLabel?: string;
  statusTone?: StatusBadgeTone;
  onPress?: () => void;
}

export function SellerListCard({
  title,
  subtitle,
  meta,
  statusLabel,
  statusTone = 'neutral',
  onPress,
}: SellerListCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <HStack className="items-start justify-between gap-3">
        <VStack className="flex-1 gap-1">
          <Text size="md" className="font-semibold text-typography-900">
            {title}
          </Text>
          {subtitle ? (
            <Text size="sm" className="text-typography-600">
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Text size="xs" className="text-typography-500">
              {meta}
            </Text>
          ) : null}
        </VStack>
        {statusLabel ? <StatusBadge label={statusLabel} tone={statusTone} /> : null}
      </HStack>
    </Pressable>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <VStack className="gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} className="h-20 rounded-xl bg-secondary-200 opacity-60" />
      ))}
    </VStack>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
});
