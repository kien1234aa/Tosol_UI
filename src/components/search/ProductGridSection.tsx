import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { searchCopy } from '@/src/configs/search';
import type { SearchProduct } from '@/src/types/search/search.types';
import { ProductCard } from './ProductCard';

const GRID_GAP = 12;

function pairRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }
  return rows;
}

interface ProductGridSectionProps {
  products: SearchProduct[];
  onPressProduct?: (product: SearchProduct) => void;
}

function ProductGridSectionComponent({
  products,
  onPressProduct,
}: ProductGridSectionProps) {
  const rows = useMemo(() => pairRows(products), [products]);

  const handlePress = useCallback(
    (product: SearchProduct) => () => onPressProduct?.(product),
    [onPressProduct],
  );

  return (
    <VStack className="w-full" space="md">
      <Text size="lg" className="font-bold text-typography-900">
        {searchCopy.productsSection}
      </Text>

      {products.length === 0 ? (
        <Center className="py-8">
          <Text size="sm" className="text-center text-typography-500">
            {searchCopy.emptyResults}
          </Text>
        </Center>
      ) : (
        <VStack className="w-full" style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <HStack key={`product-row-${rowIndex}`} style={styles.row}>
              {row.map(product => (
                <Box key={product.id} style={styles.cell}>
                  <ProductCard
                    product={product}
                    onPress={handlePress(product)}
                  />
                </Box>
              ))}
              {row.length === 1 ? <Box style={styles.cell} /> : null}
            </HStack>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
    width: '100%',
  },
  cell: {
    flex: 1,
  },
});

export const ProductGridSection = memo(ProductGridSectionComponent);
