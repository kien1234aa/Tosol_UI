import React, { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { consignmentCopy } from '@/src/configs/consignment';
import { mainLayout } from '@/src/configs/main';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
  lightTokens,
} from '@/src/configs/theme';
import { useCreateConsignment } from '@/src/hooks/consignment';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { addConsignmentOrders } from '@/src/redux/consignment';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import {
  ConsignmentPackageCard,
} from '@/src/components/consignment';
import { StackHeader } from '@/src/components/main';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type CreateConsignmentScreenProps =
  HomeStackScreenProps<'CreateConsignment'>;

export function CreateConsignmentScreen({
  navigation,
}: CreateConsignmentScreenProps) {
  const {
    packages,
    errors,
    canAddPackage,
    canRemovePackage,
    onAddPackage,
    onRemovePackage,
    onChangeField,
    onSubmit,
    reset,
  } = useCreateConsignment();

  const dispatch = useAppDispatch();
  const handleBack = useStackGoBack(navigation, 'HomeMain');

  const handleSubmit = useCallback(() => {
    onSubmit(() => {
      dispatch(
        addConsignmentOrders(
          packages.map(item => ({
            trackingCode: item.trackingCode,
            productName: item.productName,
            note: item.note,
          })),
        ),
      );
      reset();
      navigation.replace('ConsignmentList');
    });
  }, [dispatch, navigation, onSubmit, packages, reset]);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <StackHeader
            title={consignmentCopy.screenTitle}
            onPressBack={handleBack}
            backAccessibilityLabel={consignmentCopy.back}
            uppercase={false}
          />

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}>
              <Box style={styles.sectionCard}>
                <HStack style={styles.sectionHeader}>
                  <Text size="md" className="font-bold text-typography-900">
                    {consignmentCopy.sectionTitle}
                  </Text>

                  <RNPressable
                    onPress={onAddPackage}
                    disabled={!canAddPackage}
                    accessibilityRole="button"
                    accessibilityLabel={consignmentCopy.addPackage}
                    style={[
                      styles.addButton,
                      !canAddPackage && styles.addButtonDisabled,
                    ]}>
                    <Plus color={lightTokens.typography0} size={16} />
                    <Text
                      size="sm"
                      className="font-semibold text-typography-0"
                      style={buttonLabelStyle}>
                      {consignmentCopy.addPackage}
                    </Text>
                  </RNPressable>
                </HStack>

                <Box style={styles.divider} />

                <VStack space="md">
                  {packages.map((draft, index) => (
                    <ConsignmentPackageCard
                      key={draft.id}
                      draft={draft}
                      index={index}
                      errors={errors[draft.id]}
                      canRemove={canRemovePackage}
                      onChangeField={onChangeField}
                      onRemove={onRemovePackage}
                    />
                  ))}
                </VStack>
              </Box>

              <RNPressable
                onPress={handleSubmit}
                accessibilityRole="button"
                accessibilityLabel={consignmentCopy.submit}
                style={[buttonPrimaryCta, styles.submitButton]}>
                <Text
                  size="md"
                  className="font-semibold text-typography-0"
                  style={buttonLabelStyle}>
                  {consignmentCopy.submit}
                </Text>
              </RNPressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </VStack>
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
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  sectionCard: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  sectionHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: lightTokens.tertiary500,
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  divider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
    marginTop: 14,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: lightTokens.tertiary500,
  },
});
