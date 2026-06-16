import React, { memo, useCallback } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { consignmentCopy } from '@/src/configs/consignment';
import { lightTokens } from '@/src/configs/theme';
import type {
  ConsignmentPackageDraft,
  ConsignmentPackageErrors,
} from '@/src/types/consignment/consignment.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { ConsignmentField } from './ConsignmentField';

type EditablePackageField = 'trackingCode' | 'productName' | 'note';

interface ConsignmentPackageCardProps {
  draft: ConsignmentPackageDraft;
  index: number;
  errors?: ConsignmentPackageErrors;
  canRemove: boolean;
  onChangeField: (
    id: string,
    field: EditablePackageField,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
}

function ConsignmentPackageCardComponent({
  draft,
  index,
  errors,
  canRemove,
  onChangeField,
  onRemove,
}: ConsignmentPackageCardProps) {
  const handleChangeTracking = useCallback(
    (value: string) => onChangeField(draft.id, 'trackingCode', value),
    [draft.id, onChangeField],
  );
  const handleChangeProductName = useCallback(
    (value: string) => onChangeField(draft.id, 'productName', value),
    [draft.id, onChangeField],
  );
  const handleChangeNote = useCallback(
    (value: string) => onChangeField(draft.id, 'note', value),
    [draft.id, onChangeField],
  );
  const handleRemove = useCallback(
    () => onRemove(draft.id),
    [draft.id, onRemove],
  );

  return (
    <Box style={styles.card}>
      <HStack style={styles.header}>
        <Box style={styles.badge}>
          <Text size="sm" className="font-semibold text-tertiary-600">
            {consignmentCopy.packageLabel} {index + 1}
          </Text>
        </Box>

        {canRemove ? (
          <RNPressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={consignmentCopy.removePackage}
            hitSlop={8}
            style={styles.removeButton}>
            <Trash2 color={lightTokens.error500} size={18} />
          </RNPressable>
        ) : null}
      </HStack>

      <VStack space="md">
        <ConsignmentField
          placeholder={consignmentCopy.trackingCodePlaceholder}
          value={draft.trackingCode}
          onChangeText={handleChangeTracking}
          error={errors?.trackingCode}
        />
        <ConsignmentField
          placeholder={consignmentCopy.productNamePlaceholder}
          value={draft.productName}
          onChangeText={handleChangeProductName}
          error={errors?.productName}
        />
        <ConsignmentField
          placeholder={consignmentCopy.notePlaceholder}
          value={draft.note}
          onChangeText={handleChangeNote}
          multiline
        />
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: lightTokens.tertiary100,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEECEC',
  },
});

export const ConsignmentPackageCard = memo(ConsignmentPackageCardComponent);
