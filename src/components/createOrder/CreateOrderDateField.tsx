import React, { memo, useCallback, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react-native';
import { createOrderCopy } from '@/src/configs/createOrder/createOrder.constants';
import { lightTokens } from '@/src/configs/theme';
import { isoDateToDisplay } from '@/src/helpers/orders/orderFilters.helpers';
import {
  OrderFilterDatePickerSheet,
} from '@/src/components/orders/OrderFilterDateField';
import {
  CreateOrderFieldLabel,
  createOrderFieldShellClass,
} from './createOrderFormFields';
import { Box } from '@/src/uikits/box';
import { FormControl } from '@/src/uikits/form-control';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface CreateOrderDateFieldProps {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
}

function CreateOrderDateFieldComponent({
  label,
  value,
  onChange,
}: CreateOrderDateFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const displayValue = useMemo(
    () => (value ? isoDateToDisplay(value) : createOrderCopy.selectOrderDate),
    [value],
  );
  const isPlaceholder = !value;

  const handleOpen = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  const handleApply = useCallback(
    (isoDate: string) => {
      onChange(isoDate);
      setIsPickerOpen(false);
    },
    [onChange],
  );

  return (
    <>
      <FormControl className="w-full">
        <CreateOrderFieldLabel label={label} />
        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${displayValue}`}>
          <Box className={createOrderFieldShellClass}>
            <HStack className="items-center gap-2">
              <HStack className="items-center justify-center">
                <Calendar color={lightTokens.tertiary600} size={18} />
              </HStack>
              <Text
                size="sm"
                numberOfLines={1}
                className={
                  isPlaceholder
                    ? 'flex-1 text-typography-400'
                    : 'flex-1 text-typography-900'
                }>
                {displayValue}
              </Text>
            </HStack>
          </Box>
        </Pressable>
      </FormControl>

      {isPickerOpen ? (
        <OrderFilterDatePickerSheet
          label={createOrderCopy.orderDatePickerTitle}
          value={value}
          onApply={handleApply}
          onClose={handleClose}
        />
      ) : null}
    </>
  );
}

export const CreateOrderDateField = memo(CreateOrderDateFieldComponent);
