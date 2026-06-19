import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { awaitingPaymentCopy } from '@/src/configs/orders';
import { mainLayout } from '@/src/configs/main';
import { useAwaitingPayment } from '@/src/hooks/orders';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import type { AwaitingPaymentItem } from '@/src/types/orders/awaitingPayment.types';
import {
  AwaitingPaymentCard,
  AwaitingPaymentSummary,
} from '@/src/components/orders';
import { StackHeader } from '@/src/components/main';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type AwaitingPaymentScreenProps = HomeStackScreenProps<'AwaitingPayment'>;

export function AwaitingPaymentScreen({
  navigation,
}: AwaitingPaymentScreenProps) {
  const blockFeature = useFeatureInDevelopmentNotice();
  const {
    items,
    totals,
    availableBalanceVnd,
    allSelected,
    isSelected,
  } = useAwaitingPayment();

  const handleBack = useStackGoBack(navigation, 'HomeMain');

  const handlePay = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleToggleSelectAll = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleToggleItem = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const renderItem = useCallback<ListRenderItem<AwaitingPaymentItem>>(
    ({ item }) => (
      <AwaitingPaymentCard
        item={item}
        selected={isSelected(item.id)}
        onToggle={handleToggleItem}
      />
    ),
    [handleToggleItem, isSelected],
  );

  const keyExtractor = useCallback((item: AwaitingPaymentItem) => item.id, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <StackHeader
            title={awaitingPaymentCopy.screenTitle}
            onPressBack={handleBack}
            backAccessibilityLabel={awaitingPaymentCopy.back}
          />

          <Box style={styles.summaryWrap}>
            <AwaitingPaymentSummary
              totals={totals}
              availableBalanceVnd={availableBalanceVnd}
              allSelected={allSelected}
              onPay={handlePay}
              onToggleSelectAll={handleToggleSelectAll}
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
                  {awaitingPaymentCopy.empty}
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
