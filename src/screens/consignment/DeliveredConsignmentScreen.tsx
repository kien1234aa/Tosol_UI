import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deliveredConsignmentCopy } from '@/src/configs/consignment';
import { mainLayout } from '@/src/configs/main';
import { useDeliveredConsignment } from '@/src/hooks/consignment';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import type { DeliveredConsignmentItem } from '@/src/types/consignment/deliveredConsignment.types';
import { DeliveredConsignmentCard } from '@/src/components/consignment';
import { StackHeader } from '@/src/components/main';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type DeliveredConsignmentScreenProps =
  HomeStackScreenProps<'DeliveredConsignment'>;

export function DeliveredConsignmentScreen({
  navigation,
}: DeliveredConsignmentScreenProps) {
  useFeatureInDevelopmentNotice();
  const { items } = useDeliveredConsignment();

  const handleBack = useStackGoBack(navigation, 'HomeMain');

  const renderItem = useCallback<ListRenderItem<DeliveredConsignmentItem>>(
    ({ item }) => <DeliveredConsignmentCard item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: DeliveredConsignmentItem) => item.id,
    [],
  );

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <StackHeader
            title={deliveredConsignmentCopy.screenTitle}
            onPressBack={handleBack}
            backAccessibilityLabel={deliveredConsignmentCopy.back}
          />

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
                  {deliveredConsignmentCopy.empty}
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
