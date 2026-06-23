import React, { useCallback } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productsCopy } from '@/src/configs/products';
import { mainLayout } from '@/src/configs/main';
import {
  ProfileMenuRow,
  ProfileProductDetailView,
  ProfileSectionCard,
  ProfileStackHeader,
} from '@/src/components/profile';
import { useProfileProductDetail } from '@/src/hooks/profile';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { ProductDetailSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ProfileProductDetailScreenProps =
  ProfileStackScreenProps<'ProductDetail'>;

export function ProfileProductDetailScreen({
  navigation,
  route,
}: ProfileProductDetailScreenProps) {
  const { productId } = route.params;
  const {
    product,
    isLoading,
    isRefreshing,
    isDeleting,
    loadError,
    reload,
    deleteProduct,
  } = useProfileProductDetail(productId);

  const handleBack = useStackGoBack(navigation, 'ProductList');

  const handleEdit = useCallback(() => {
    navigation.navigate('EditProduct', { productId });
  }, [navigation, productId]);

  const handleDelete = useCallback(() => {
    if (!product || isDeleting) {
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
              try {
                await deleteProduct();
                Alert.alert(productsCopy.deleteSuccess, undefined, [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('ProductList'),
                  },
                ]);
              } catch (error) {
                Alert.alert(
                  error instanceof Error
                    ? error.message
                    : productsCopy.deleteError,
                );
              }
            })();
          },
        },
      ],
    );
  }, [deleteProduct, isDeleting, navigation, product]);

  const showContent = product != null;

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProfileStackHeader
            title={productsCopy.detailScreenTitle}
            onPressBack={handleBack}
          />

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
                  {loadError ?? productsCopy.detailNotFound}
                </Text>
                <Pressable
                  onPress={() => void reload()}
                  accessibilityRole="button">
                  <Text size="sm" className="font-semibold text-tertiary-600">
                    {productsCopy.retry}
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
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => void reload()}
                />
              }>
              <ProfileProductDetailView product={product} />

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
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
  },
  skeletonContent: {
    paddingHorizontal: 0,
  },
});
