import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mainLayout } from '@/src/configs/main';
import { useConsignmentList } from '@/src/hooks/consignment';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import type {
  ConsignmentOrderItem,
  ConsignmentStatusFilter,
} from '@/src/types/consignment/consignment.types';
import {
  ConsignmentFilterSheet,
  ConsignmentListHeader,
  ConsignmentOrderCard,
} from '@/src/components/consignment';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';

type ConsignmentListScreenProps = HomeStackScreenProps<'ConsignmentList'>;

export function ConsignmentListScreen({
  navigation,
}: ConsignmentListScreenProps) {
  const blockFeature = useFeatureInDevelopmentNotice();
  const {
    orders,
    statusFilter,
    isFilterOpen,
    filterOptions,
    emptyMessage,
    onCloseFilter,
  } = useConsignmentList();

  const handleBack = useStackGoBack(navigation, 'HomeMain');

  const handleAdd = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleView = useCallback(
    (_orderId: string) => {
      blockFeature();
    },
    [blockFeature],
  );

  const handleOpenFilter = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleRemoveOrder = useCallback(
    (_orderId: string) => {
      blockFeature();
    },
    [blockFeature],
  );

  const handleSelectFilter = useCallback(
    (_filter: ConsignmentStatusFilter) => {
      blockFeature();
    },
    [blockFeature],
  );

  const renderItem = useCallback<ListRenderItem<ConsignmentOrderItem>>(
    ({ item }) => (
      <ConsignmentOrderCard
        order={item}
        onView={handleView}
        onRemove={handleRemoveOrder}
      />
    ),
    [handleRemoveOrder, handleView],
  );

  const keyExtractor = useCallback(
    (item: ConsignmentOrderItem) => item.id,
    [],
  );

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ConsignmentListHeader
          onPressBack={handleBack}
          onPressFilter={handleOpenFilter}
          onPressAdd={handleAdd}
        />

        <FlatList
          data={orders}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            orders.length === 0 ? styles.emptyContent : styles.content
          }
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={
            <Center className="py-16">
              <Text size="md" className="text-center text-typography-500">
                {emptyMessage}
              </Text>
            </Center>
          }
        />

        <ConsignmentFilterSheet
          visible={isFilterOpen}
          options={filterOptions}
          selectedFilter={statusFilter}
          onClose={onCloseFilter}
          onSelect={handleSelectFilter}
        />
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
});
