import React, { useCallback, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productDetailCopy } from '@/src/configs/search';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import {
  buildAddDraftProductPayload,
  validateAddDraftProduct,
} from '@/src/helpers/createOrder/draftProduct.helpers';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { useProductDetail } from '@/src/hooks/search';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { SearchStackScreenProps } from '@/src/navigation/types';
import {
  addDraftProduct,
  ensureDraftWithProduct,
  makeSelectDraftGroups,
  selectActiveDraftId,
  selectEmptyDraftGroups,
} from '@/src/redux/createOrderDraft';
import { recordPreference } from '@/src/redux/preferences';
import { store } from '@/src/redux/store';
import { buildSearchProductPreferenceRecord } from '@/src/helpers/preferences/productPreference.helpers';
import {
  ProductDetailActions,
  ProductDetailContent,
  ProductDetailHeader,
} from '@/src/components/search/ProductDetailView';
import { ProductDetailSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ProductDetailScreenProps = SearchStackScreenProps<'ProductDetail'>;

export function ProductDetailScreen({
  navigation,
  route,
}: ProductDetailScreenProps) {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const activeDraftId = useAppSelector(selectActiveDraftId);
  const selectActiveDraftGroups = useMemo(
    () =>
      activeDraftId
        ? makeSelectDraftGroups(activeDraftId)
        : selectEmptyDraftGroups,
    [activeDraftId],
  );
  const activeDraftGroups = useAppSelector(selectActiveDraftGroups);
  const {
    product,
    quantity,
    pricing,
    isLoading,
    error,
    canDecreaseQuantity,
    canIncreaseQuantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
    reload,
  } = useProductDetail(productId);

  const handleBack = useStackGoBack(navigation, 'SearchMain');

  const handleBuyNow = useCallback(() => {
    if (!product) {
      return;
    }

    const payload = buildAddDraftProductPayload(product, quantity);
    const validationGroups = activeDraftId ? activeDraftGroups : [];
    const result = validateAddDraftProduct(validationGroups, payload, quantity);

    if (!result.success) {
      Alert.alert('Không thể lên đơn', result.message);
      return;
    }

    if (activeDraftId) {
      dispatch(addDraftProduct({ draftId: activeDraftId, payload }));
    } else {
      dispatch(ensureDraftWithProduct(payload));
    }

    dispatch(recordPreference(buildSearchProductPreferenceRecord(product)));

    const draftId =
      activeDraftId ?? store.getState().createOrderDraft.activeDraftId;

    if (!draftId) {
      return;
    }

    navigation.getParent()?.navigate('CreateOrder', {
      screen: 'CreateOrderEdit',
      params: { draftId },
    });
  }, [
    activeDraftGroups,
    activeDraftId,
    dispatch,
    navigation,
    product,
    quantity,
  ]);

  const showContent = product && pricing;
  const isOutOfStock = product?.isOutOfStock ?? false;

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProductDetailHeader onPressBack={handleBack} />

          {isLoading && !showContent ? (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}>
              <ProductDetailSkeleton style={styles.skeletonContent} />
            </ScrollView>
          ) : null}

          {!isLoading && !showContent ? (
            <Center className="flex-1 px-6">
              <VStack className="items-center" space="md">
                <Text size="md" className="text-center text-typography-500">
                  {error ?? productDetailCopy.notFound}
                </Text>
                <Pressable onPress={reload} accessibilityRole="button">
                  <Text size="sm" className="font-semibold text-tertiary-600">
                    Thử lại
                  </Text>
                </Pressable>
              </VStack>
            </Center>
          ) : null}

          {showContent ? (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled">
              <ProductDetailContent
                product={product}
                quantity={quantity}
                canDecreaseQuantity={canDecreaseQuantity}
                canIncreaseQuantity={canIncreaseQuantity}
                onDecreaseQuantity={onDecreaseQuantity}
                onIncreaseQuantity={onIncreaseQuantity}
              />

              <Box style={styles.inlineActions}>
                <ProductDetailActions
                  pricing={pricing}
                  disabled={isOutOfStock}
                  onPressBuyNow={handleBuyNow}
                />
              </Box>
            </ScrollView>
          ) : null}
        </VStack>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
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
  inlineActions: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lightTokens.outline100,
  },
});
