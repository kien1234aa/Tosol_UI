import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orderDetailCopy } from '@/src/configs/orders';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import { OrderCancelReasonModal } from '@/src/components/orders/OrderCancelReasonModal';
import { OrderEditModal } from '@/src/components/orders/OrderEditModal';
import {
  OrderDetailActions,
  OrderDetailCostBreakdown,
  OrderDetailHeader,
  OrderDetailIssue,
  OrderDetailNote,
  OrderDetailProducts,
  OrderDetailShipping,
  OrderDetailSummary,
} from '@/src/components/orders/OrderDetailView';
import { showFeatureInDevelopmentAlert } from '@/src/helpers/app';
import { useOrderCancel, useOrderDetail, useOrderEdit } from '@/src/hooks/orders';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { OrdersStackScreenProps } from '@/src/navigation/types';
import { DetailScreenSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type OrderDetailScreenProps = OrdersStackScreenProps<'OrderDetail'>;

interface OrderDetailBodyProps {
  order: ReturnType<typeof useOrderDetail>['order'];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  canPay: boolean;
  canCancel: boolean;
  canEdit: boolean;
  onPressPay: () => void;
  onPressCancel: () => void;
  onPressEdit: () => void;
}

function OrderDetailBody({
  order,
  isLoading,
  error,
  reload,
  canPay,
  canCancel,
  canEdit,
  onPressPay,
  onPressCancel,
  onPressEdit,
}: OrderDetailBodyProps) {
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isLoading}
        onRefresh={reload}
        tintColor={lightTokens.tertiary600}
      />
    ),
    [isLoading, reload],
  );

  if (isLoading && !order) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <DetailScreenSkeleton style={styles.skeletonContent} />
      </ScrollView>
    );
  }

  if (!order) {
    return (
      <Center className="flex-1 px-4 py-16">
        <Text size="sm" className="mb-3 text-center text-typography-500">
          {error ?? orderDetailCopy.notFound}
        </Text>
        {error ? (
          <Pressable onPress={reload} accessibilityRole="button">
            <Text size="sm" className="font-semibold text-tertiary-600">
              {orderDetailCopy.retry}
            </Text>
          </Pressable>
        ) : null}
      </Center>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}>
      <VStack className="w-full" space="md">
        <OrderDetailSummary order={order} />
        <OrderDetailProducts products={order.products} />
        {order.shipping ? (
          <OrderDetailShipping shipping={order.shipping} />
        ) : null}
        {order.hasIssue && order.issueNote ? (
          <OrderDetailIssue issueNote={order.issueNote} />
        ) : null}
        <OrderDetailNote note={order.note} />
        <OrderDetailCostBreakdown order={order} />
        <OrderDetailActions
          canPay={canPay}
          canCancel={canCancel}
          canEdit={canEdit}
          remainingVnd={order.costs.remainingVnd}
          onPressPay={onPressPay}
          onPressCancel={onPressCancel}
          onPressEdit={onPressEdit}
        />
      </VStack>
    </ScrollView>
  );
}

export function OrderDetailScreen({
  navigation,
  route,
}: OrderDetailScreenProps) {
  const { orderId } = route.params;
  const { order, isLoading, error, reload, canPay, canCancel, canEdit } =
    useOrderDetail(orderId);

  const {
    isVisible: isCancelVisible,
    orderNumber: cancelOrderNumber,
    reason: cancelReason,
    isSubmitting: isCancelling,
    error: cancelError,
    openCancel,
    closeCancel,
    onChangeReason: onChangeCancelReason,
    confirmCancel,
  } = useOrderCancel({ onSuccess: reload });

  const {
    isVisible: isEditVisible,
    orderNumber: editOrderNumber,
    note: editNote,
    isSubmitting: isEditing,
    error: editError,
    openEdit,
    closeEdit,
    onChangeNote: onChangeEditNote,
    confirmEdit,
  } = useOrderEdit({ onSuccess: reload });

  const handleBack = useStackGoBack(navigation, 'OrdersMain');

  const handlePay = useCallback(() => {
    showFeatureInDevelopmentAlert();
  }, []);

  const handleCancel = useCallback(() => {
    openCancel(orderId);
  }, [openCancel, orderId]);

  const handleEdit = useCallback(() => {
    openEdit(orderId, order?.note ?? '');
  }, [openEdit, order?.note, orderId]);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <OrderDetailHeader onPressBack={handleBack} />
          <OrderDetailBody
            order={order}
            isLoading={isLoading}
            error={error}
            reload={reload}
            canPay={canPay}
            canCancel={canCancel}
            canEdit={canEdit}
            onPressPay={handlePay}
            onPressCancel={handleCancel}
            onPressEdit={handleEdit}
          />
        </VStack>

        <OrderCancelReasonModal
          visible={isCancelVisible}
          orderNumber={cancelOrderNumber}
          reason={cancelReason}
          isSubmitting={isCancelling}
          error={cancelError}
          onChangeReason={onChangeCancelReason}
          onClose={closeCancel}
          onConfirm={confirmCancel}
        />

        <OrderEditModal
          visible={isEditVisible}
          orderNumber={editOrderNumber}
          note={editNote}
          isSubmitting={isEditing}
          error={editError}
          onChangeNote={onChangeEditNote}
          onClose={closeEdit}
          onConfirm={confirmEdit}
        />
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
  skeletonContent: {
    paddingHorizontal: 0,
  },
});
