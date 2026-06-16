import React, { useCallback } from 'react';
import { Alert, FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { awaitingDepositCopy } from '@/src/configs/orders';
import { mainLayout } from '@/src/configs/main';
import { useAwaitingDeposit } from '@/src/hooks/orders';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { OrdersStackScreenProps } from '@/src/navigation/types';
import type { AwaitingDepositItem } from '@/src/types/orders/awaitingDeposit.types';
import {
  AwaitingDepositCard,
  AwaitingDepositSummary,
} from '@/src/components/orders';
import { StackHeader } from '@/src/components/main';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type AwaitingDepositScreenProps = OrdersStackScreenProps<'AwaitingDeposit'>;

export function AwaitingDepositScreen({
  navigation,
}: AwaitingDepositScreenProps) {
  const {
    items,
    totals,
    availableBalanceVnd,
    allSelected,
    isSelected,
    onToggleItem,
    onToggleSelectAll,
    clearSelection,
    removeSelected,
  } = useAwaitingDeposit();

  const handleBack = useStackGoBack(navigation, 'OrdersMain');

  const handleDeposit = useCallback(() => {
    if (totals.selectedCount === 0) {
      Alert.alert(awaitingDepositCopy.selectPrompt);
      return;
    }
    Alert.alert(awaitingDepositCopy.depositSuccess);
    clearSelection();
  }, [clearSelection, totals.selectedCount]);

  const handleCancel = useCallback(() => {
    if (totals.selectedCount === 0) {
      Alert.alert(awaitingDepositCopy.selectPrompt);
      return;
    }
    Alert.alert(awaitingDepositCopy.cancelSuccess);
    removeSelected();
  }, [removeSelected, totals.selectedCount]);

  const renderItem = useCallback<ListRenderItem<AwaitingDepositItem>>(
    ({ item }) => (
      <AwaitingDepositCard
        item={item}
        selected={isSelected(item.id)}
        onToggle={onToggleItem}
      />
    ),
    [isSelected, onToggleItem],
  );

  const keyExtractor = useCallback((item: AwaitingDepositItem) => item.id, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <StackHeader
            title={awaitingDepositCopy.screenTitle}
            onPressBack={handleBack}
            backAccessibilityLabel={awaitingDepositCopy.back}
          />

          <Box style={styles.summaryWrap}>
            <AwaitingDepositSummary
              totals={totals}
              availableBalanceVnd={availableBalanceVnd}
              allSelected={allSelected}
              onDeposit={handleDeposit}
              onCancel={handleCancel}
              onToggleSelectAll={onToggleSelectAll}
            />
          </Box>

          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              items.length === 0 ? styles.emptyContent : styles.content
            }
            ItemSeparatorComponent={ListSeparator}
            ListEmptyComponent={
              <Center className="py-16">
                <Text size="md" className="text-center text-typography-500">
                  {awaitingDepositCopy.empty}
                </Text>
              </Center>
            }
          />
        </VStack>
      </SafeAreaView>
    </Box>
  );
}

function ListSeparator() {
  return <Box style={styles.separator} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  summaryWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  separator: {
    height: 12,
  },
});
