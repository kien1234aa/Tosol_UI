import React, { memo } from 'react';
import { Plus } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { draftCopy } from '@/src/configs/createOrder';
import { lightTokens } from '@/src/configs/theme';
import type { DraftProductGroupViewModel } from '@/src/types/createOrderDraft/createOrderDraft.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import {
  CreateOrderSectionHeader,
  createOrderSectionCardClass,
} from './createOrderFormFields';
import { DraftProductItemCard } from './DraftProductItemCard';

interface CreateOrderProductsSectionProps {
  sectionNumber?: number;
  groups: DraftProductGroupViewModel[];
  canAddProduct?: boolean;
  onPressAddProduct: () => void;
  onChangeQuantity: (
    groupId: string,
    productId: string,
    quantity: number,
  ) => void;
  onChangeUnitPrice: (
    groupId: string,
    productId: string,
    unitPriceVnd: number,
  ) => void;
  onChangeTaxRate: (
    groupId: string,
    productId: string,
    taxRatePercent: number,
  ) => void;
  onRemoveProduct: (groupId: string, productId: string) => void;
}

function CreateOrderProductsSectionComponent({
  sectionNumber = 2,
  groups,
  canAddProduct = true,
  onPressAddProduct,
  onChangeQuantity,
  onChangeUnitPrice,
  onChangeTaxRate,
  onRemoveProduct,
}: CreateOrderProductsSectionProps) {
  const addProductAction = (
    <Pressable
      onPress={canAddProduct ? onPressAddProduct : undefined}
      disabled={!canAddProduct}
      accessibilityRole="button"
      accessibilityLabel={draftCopy.addProductAction}
      accessibilityState={{ disabled: !canAddProduct }}
      hitSlop={8}
      style={!canAddProduct ? styles.addProductDisabled : undefined}>
      <HStack className="items-center gap-1">
        <Plus
          color={canAddProduct ? lightTokens.tertiary600 : lightTokens.typography500}
          size={16}
        />
        <Text
          size="sm"
          className={
            canAddProduct
              ? 'font-semibold text-tertiary-600'
              : 'font-semibold text-typography-500'
          }>
          {draftCopy.addProductAction}
        </Text>
      </HStack>
    </Pressable>
  );

  const productEntries = groups.flatMap(group =>
    group.products.map(product => ({
      groupId: group.id,
      product,
    })),
  );

  return (
    <Box className={createOrderSectionCardClass}>
      <CreateOrderSectionHeader
        number={sectionNumber}
        title={draftCopy.productsSection}
        action={addProductAction}
      />

      {productEntries.length > 0 ? (
        <VStack space="sm">
          {productEntries.map(({ groupId, product }) => (
            <DraftProductItemCard
              key={product.id}
              product={product}
              onChangeQuantity={quantity =>
                onChangeQuantity(groupId, product.id, quantity)
              }
              onChangeUnitPrice={unitPriceVnd =>
                onChangeUnitPrice(groupId, product.id, unitPriceVnd)
              }
              onChangeTaxRate={taxRatePercent =>
                onChangeTaxRate(groupId, product.id, taxRatePercent)
              }
              onRemove={() => onRemoveProduct(groupId, product.id)}
            />
          ))}
        </VStack>
      ) : (
        <Center className="py-6">
          <Text size="sm" className="text-center text-typography-500">
            {canAddProduct
              ? draftCopy.emptyDraft
              : draftCopy.addProductRequiresWarehouse}
          </Text>
        </Center>
      )}
    </Box>
  );
}

export const CreateOrderProductsSection = memo(
  CreateOrderProductsSectionComponent,
);

const styles = StyleSheet.create({
  addProductDisabled: {
    opacity: 0.45,
  },
});
