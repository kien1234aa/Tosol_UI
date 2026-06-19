import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consignmentDetailCopy } from '@/src/configs/consignment';
import { mainLayout } from '@/src/configs/main';
import {
  ConsignmentDetailCost,
  ConsignmentDetailHeader,
  ConsignmentDetailInfo,
  ConsignmentDetailNote,
  ConsignmentDetailSummary,
} from '@/src/components/consignment';
import { useConsignmentDetail } from '@/src/hooks/consignment';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ConsignmentDetailScreenProps =
  HomeStackScreenProps<'ConsignmentDetail'>;

export function ConsignmentDetailScreen({
  navigation,
  route,
}: ConsignmentDetailScreenProps) {
  useFeatureInDevelopmentNotice();
  const { orderId } = route.params;
  const { order } = useConsignmentDetail(orderId);

  const handleBack = useStackGoBack(navigation, 'ConsignmentList');

  if (!order) {
    return (
      <Box className="flex-1 bg-background-50">
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <VStack className="flex-1">
            <ConsignmentDetailHeader onPressBack={handleBack} />
            <Center className="flex-1 px-4">
              <Text size="md" className="text-center text-typography-500">
                {consignmentDetailCopy.notFound}
              </Text>
            </Center>
          </VStack>
        </SafeAreaView>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ConsignmentDetailHeader onPressBack={handleBack} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <VStack className="w-full" space="md">
              <ConsignmentDetailSummary order={order} />
              <ConsignmentDetailInfo order={order} />
              <ConsignmentDetailNote note={order.note} />
              <ConsignmentDetailCost order={order} />
            </VStack>
          </ScrollView>
        </VStack>
      </SafeAreaView>
    </Box>
  );
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
});
