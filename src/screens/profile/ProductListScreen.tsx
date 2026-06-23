import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package } from 'lucide-react-native';
import { productsService } from '@/src/apis/products';
import { productsCopy } from '@/src/configs/products';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import {
  ProductListCard,
  ProfileListStatCard,
  ProfileStackHeader,
} from '@/src/components/profile';
import { useProductList } from '@/src/hooks/profile';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectAuthSellerId } from '@/src/redux/login';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import type { ProductListItem } from '@/src/types/products';
import { ListLoadingGate } from '@/src/shared/components/ui/ListLoadingGate';
import { ListScreenSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ProductListScreenProps = ProfileStackScreenProps<'ProductList'>;

export function ProductListScreen({ navigation }: ProductListScreenProps) {
  const sellerId = useAppSelector(selectAuthSellerId);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );
  const {
    products,
    total,
    isLoading,
    isRefreshing,
    isLoadingMore,
    loadError,
    hasMore,
    reload,
    loadMore,
  } = useProductList(sellerId);

  const handleBack = useStackGoBack(navigation, 'ProfileMain');

  const handleOpenProduct = useCallback(
    (id: number) => {
      navigation.navigate('ProductDetail', { productId: String(id) });
    },
    [navigation],
  );

  const handleEditProduct = useCallback(
    (id: number) => {
      navigation.navigate('EditProduct', { productId: String(id) });
    },
    [navigation],
  );

  const handleDeleteProduct = useCallback(
    (id: number) => {
      const target = products.find(product => product.id === id);
      if (!target || deletingProductId != null) {
        return;
      }

      Alert.alert(
        productsCopy.deleteConfirmTitle,
        `${productsCopy.deleteConfirmMessage}\n\n${target.name}`,
        [
          { text: productsCopy.cancel, style: 'cancel' },
          {
            text: productsCopy.deleteProduct,
            style: 'destructive',
            onPress: () => {
              void (async () => {
                setDeletingProductId(id);
                try {
                  await productsService.delete(id);
                  Alert.alert(productsCopy.deleteSuccess);
                  await reload();
                } catch (error) {
                  Alert.alert(
                    error instanceof Error
                      ? error.message
                      : productsCopy.deleteError,
                  );
                } finally {
                  setDeletingProductId(null);
                }
              })();
            },
          },
        ],
      );
    },
    [deletingProductId, products, reload],
  );

  const renderItem = useCallback<ListRenderItem<ProductListItem>>(
    ({ item }) => (
      <ProductListCard
        product={item}
        onPress={handleOpenProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        actionsDisabled={deletingProductId != null}
      />
    ),
    [
      deletingProductId,
      handleDeleteProduct,
      handleEditProduct,
      handleOpenProduct,
    ],
  );

  const keyExtractor = useCallback((item: ProductListItem) => item.uuid, []);

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  const listSkeleton = useMemo(
    () => (
      <ListScreenSkeleton
        count={5}
        showSectionHeader={false}
        withLeading
        style={styles.skeletonContent}
      />
    ),
    [],
  );

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefreshing} onRefresh={reload} />,
    [isRefreshing, reload],
  );

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProfileStackHeader
            title={productsCopy.listScreenTitle}
            onPressBack={handleBack}
          />

          <ProfileListStatCard
            icon={Package}
            label={productsCopy.totalLabel}
            value={total}
          />

          <ListLoadingGate
            loading={isLoading}
            refreshing={isRefreshing}
            itemCount={products.length}
            options={{ canShowSkeleton: !loadError }}
            skeleton={listSkeleton}>
            {loadError && products.length === 0 ? (
              <Center className="flex-1 px-6">
                <Text size="sm" className="mb-4 text-center text-error-500">
                  {loadError}
                </Text>
                <Text
                  size="sm"
                  className="font-semibold text-tertiary-600"
                  onPress={reload}>
                  {productsCopy.retry}
                </Text>
              </Center>
            ) : (
              <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={ListSeparator}
                refreshControl={refreshControl}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.35}
                ListEmptyComponent={
                  <Center className="py-12">
                    <Text size="sm" className="text-typography-500">
                      {productsCopy.empty}
                    </Text>
                  </Center>
                }
                ListFooterComponent={
                  isLoadingMore ? (
                    <Center className="py-4">
                      <ActivityIndicator
                        color={lightTokens.tertiary600}
                        size="small"
                      />
                    </Center>
                  ) : null
                }
              />
            )}
          </ListLoadingGate>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
  },
  skeletonContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  separator: {
    height: 12,
  },
});
