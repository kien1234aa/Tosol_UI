import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productsService } from '@/src/apis/products';
import { productDetailCopy } from '@/src/configs/search';
import { productsCopy } from '@/src/configs/products';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import {
  buildAddDraftProductPayload,
  validateAddDraftProduct,
} from '@/src/helpers/createOrder/draftProduct.helpers';
import { buildSearchProductPreferenceRecord } from '@/src/helpers/preferences/productPreference.helpers';
import {
  ProfileMenuRow,
  ProfileSectionCard,
} from '@/src/components/profile';
import {
  ProductDetailActions,
  ProductDetailContent,
  ProductDetailHeader,
} from '@/src/components/search/ProductDetailView';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { useProductDetail } from '@/src/hooks/search';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import { navigateMainTabScreen } from '@/src/navigation/tabNavigation.helpers';
import type {
  ProfileStackScreenProps,
  SearchStackScreenProps,
} from '@/src/navigation/types';
import {
  addDraftProduct,
  ensureDraftWithProduct,
  makeSelectDraftGroups,
  selectActiveDraftId,
  selectEmptyDraftGroups,
} from '@/src/redux/createOrderDraft';
import { recordPreference } from '@/src/redux/preferences';
import { store } from '@/src/redux/store';
import { ProductDetailSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ProductDetailScreenProps =
  | SearchStackScreenProps<'ProductDetail'>
  | ProfileStackScreenProps<'ProductDetail'>;

export function ProductDetailScreen({
  navigation,
  route,
}: ProductDetailScreenProps) {
  const { productId, manage = false } = route.params;
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleBack = useStackGoBack(
    navigation,
    manage ? 'ProductList' : 'SearchMain',
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    reload();
  }, [reload]);

  useEffect(() => {
    if (isRefreshing && !isLoading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isLoading]);

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

    navigateMainTabScreen(navigation, 'CreateOrder', {
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

  const handleEdit = useCallback(() => {
    if (!manage) {
      return;
    }

    navigation.navigate('EditProduct', { productId });
  }, [manage, navigation, productId]);

  const handleDelete = useCallback(() => {
    if (!manage || !product || isDeleting) {
      return;
    }

    Alert.alert(
      productsCopy.deleteConfirmTitle,
      `${productsCopy.deleteConfirmMessage}\n\n${product.name}`,
      [
        { text: productsCopy.cancel, style: 'cancel' },
        {
          text: productsCopy.deleteProduct,
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setIsDeleting(true);
              try {
                await productsService.delete(productId);
                Alert.alert(productsCopy.deleteSuccess, undefined, [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('ProductList'),
                  },
                ]);
              } catch (deleteError) {
                Alert.alert(
                  deleteError instanceof Error
                    ? deleteError.message
                    : productsCopy.deleteError,
                );
              } finally {
                setIsDeleting(false);
              }
            })();
          },
        },
      ],
    );
  }, [isDeleting, manage, navigation, product, productId]);

  const showContent = product && pricing;
  const isOutOfStock = product?.isOutOfStock ?? false;
  const contentPaddingBottom = manage
    ? mainLayout.tabStackFooterPaddingBottom
    : mainLayout.tabContentBottomPadding;

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
              contentContainerStyle={[
                styles.content,
                { paddingBottom: contentPaddingBottom },
              ]}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                manage ? (
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => void handleRefresh()}
                  />
                ) : undefined
              }>
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

              {manage ? (
                <Box className="mt-3">
                  <ProfileSectionCard title={productsCopy.detailActionsSection}>
                    <ProfileMenuRow
                      label={productsCopy.detailEditProduct}
                      onPress={handleEdit}
                    />
                    <ProfileMenuRow
                      label={productsCopy.deleteProduct}
                      onPress={handleDelete}
                      danger
                      showChevron={false}
                    />
                  </ProfileSectionCard>
                </Box>
              ) : null}
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
