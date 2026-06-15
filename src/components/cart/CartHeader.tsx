import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { cartCopy } from '@/src/configs/cart';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Heading } from '@/src/uikits/heading';

function CartHeaderComponent() {
  return (
    <Box style={styles.container}>
      <Center>
        <Heading size="md" className="font-bold uppercase text-typography-900">
          {cartCopy.title}
        </Heading>
      </Center>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: lightTokens.tertiary50,
    borderBottomWidth: 1,
    borderBottomColor: lightTokens.outline100,
  },
});

export const CartHeader = memo(CartHeaderComponent);
