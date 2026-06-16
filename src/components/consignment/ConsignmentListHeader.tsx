import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Plus, SlidersHorizontal } from 'lucide-react-native';
import { consignmentListCopy } from '@/src/configs/consignment';
import { lightTokens } from '@/src/configs/theme';
import { StackHeader } from '@/src/components/main';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';

interface ConsignmentListHeaderProps {
  onPressBack: () => void;
  onPressFilter: () => void;
  onPressAdd: () => void;
}

function ConsignmentListHeaderComponent({
  onPressBack,
  onPressFilter,
  onPressAdd,
}: ConsignmentListHeaderProps) {
  return (
    <StackHeader
      title={consignmentListCopy.title}
      onPressBack={onPressBack}
      backAccessibilityLabel={consignmentListCopy.title}
      rightAction={
        <HStack className="items-center" space="xs">
          <Pressable
            onPress={onPressFilter}
            accessibilityRole="button"
            accessibilityLabel={consignmentListCopy.filter}
            style={styles.iconButton}>
            <SlidersHorizontal color={lightTokens.typography900} size={20} />
          </Pressable>
          <Pressable
            onPress={onPressAdd}
            accessibilityRole="button"
            accessibilityLabel={consignmentListCopy.addOrder}
            style={styles.iconButton}>
            <Plus color={lightTokens.typography900} size={22} />
          </Pressable>
        </HStack>
      }
    />
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ConsignmentListHeader = memo(ConsignmentListHeaderComponent);
