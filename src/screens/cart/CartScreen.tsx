import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartCopy } from '@/src/configs/cart';
import { mainLayout } from '@/src/configs/main';
import { useCart } from '@/src/hooks/cart';
import {
  CartGroupCard,
  CartHeader,
  CartSummaryBar,
} from '@/src/components/cart';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export function CartScreen() {
  const {
    groups,
    grandTotalVnd,
    isAllSelected,
    hasSelectedItems,
    onToggleSelectAll,
    onToggleGroup,
    onToggleProduct,
    onToggleInsurance,
    onToggleWoodPacking,
    onChangeGroupNote,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveProduct,
    onRemoveGroup,
    onCreateOrders,
    onCreateGroupOrder,
  } = useCart();

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <CartHeader />

        <CartSummaryBar
          grandTotalVnd={grandTotalVnd}
          isAllSelected={isAllSelected}
          canCreateOrders={hasSelectedItems}
          onToggleSelectAll={onToggleSelectAll}
          onCreateOrders={onCreateOrders}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          {groups.length === 0 ? (
            <Center className="py-16">
              <Text size="md" className="text-center text-typography-500">
                {cartCopy.emptyCart}
              </Text>
            </Center>
          ) : (
            <VStack className="w-full" space="md">
              {groups.map(group => (
                <CartGroupCard
                  key={group.id}
                  group={group}
                  onToggleGroup={onToggleGroup}
                  onToggleProduct={onToggleProduct}
                  onToggleInsurance={onToggleInsurance}
                  onToggleWoodPacking={onToggleWoodPacking}
                  onChangeNote={onChangeGroupNote}
                  onIncreaseQuantity={onIncreaseQuantity}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onRemoveProduct={onRemoveProduct}
                  onRemoveGroup={onRemoveGroup}
                  onCreateGroupOrder={onCreateGroupOrder}
                />
              ))}
            </VStack>
          )}
        </ScrollView>
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
    paddingBottom: mainLayout.tabBarHeight + 24,
  },
});
