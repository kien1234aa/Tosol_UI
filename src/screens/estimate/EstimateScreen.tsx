import React, { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { estimateCopy } from '@/src/configs/estimate';
import { mainLayout } from '@/src/configs/main';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
  lightTokens,
} from '@/src/configs/theme';
import { useEstimate } from '@/src/hooks/estimate';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { HomeStackScreenProps } from '@/src/navigation/types';
import type { EstimateForm } from '@/src/types/estimate/estimate.types';
import {
  EstimateField,
  EstimateResultCard,
  EstimateTabs,
} from '@/src/components/estimate';
import { StackHeader } from '@/src/components/main';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type EstimateScreenProps = HomeStackScreenProps<'Estimate'>;

export function EstimateScreen({ navigation }: EstimateScreenProps) {
  const blockFeature = useFeatureInDevelopmentNotice();
  const { mode, form, errors, result, setField } = useEstimate();

  const handleBack = useStackGoBack(navigation, 'HomeMain');

  const isBuyForMe = mode === 'buyForMe';
  const submitLabel = isBuyForMe
    ? estimateCopy.submitBuyForMe
    : estimateCopy.submitConsignment;

  const handleField = useCallback(
    (field: keyof EstimateForm) => (value: string) => setField(field, value),
    [setField],
  );

  const handleModeChange = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  const handleSubmit = useCallback(() => {
    blockFeature();
  }, [blockFeature]);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <StackHeader
            title={estimateCopy.screenTitle}
            onPressBack={handleBack}
            backAccessibilityLabel={estimateCopy.back}
          />

          <Box style={styles.tabsWrap}>
            <EstimateTabs mode={mode} onChange={handleModeChange} />
          </Box>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}>
              <VStack className="w-full" space="md">
                {isBuyForMe ? (
                  <EstimateField
                    placeholder={estimateCopy.priceCnyPlaceholder}
                    value={form.priceCny}
                    onChangeText={handleField('priceCny')}
                    error={errors.priceCny}
                  />
                ) : null}

                <EstimateField
                  placeholder={estimateCopy.weightPlaceholder}
                  value={form.weightKg}
                  onChangeText={handleField('weightKg')}
                  error={errors.weightKg}
                />

                <Text size="sm" className="font-semibold text-typography-900">
                  {estimateCopy.dimensionsLabel}
                </Text>

                <HStack className="w-full" space="sm">
                  <EstimateField
                    placeholder={estimateCopy.lengthPlaceholder}
                    value={form.lengthCm}
                    onChangeText={handleField('lengthCm')}
                    className="flex-1"
                  />
                  <EstimateField
                    placeholder={estimateCopy.widthPlaceholder}
                    value={form.widthCm}
                    onChangeText={handleField('widthCm')}
                    className="flex-1"
                  />
                  <EstimateField
                    placeholder={estimateCopy.heightPlaceholder}
                    value={form.heightCm}
                    onChangeText={handleField('heightCm')}
                    className="flex-1"
                  />
                </HStack>

                <RNPressable
                  onPress={handleSubmit}
                  accessibilityRole="button"
                  accessibilityLabel={submitLabel}
                  style={[buttonPrimaryCta, styles.submitButton]}>
                  <Text
                    size="md"
                    className="font-semibold text-typography-0"
                    style={buttonLabelStyle}>
                    {submitLabel}
                  </Text>
                </RNPressable>

                {result ? <EstimateResultCard result={result} /> : null}
              </VStack>
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
  tabsWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  submitButton: {
    width: '100%',
    marginTop: 4,
    backgroundColor: lightTokens.tertiary500,
  },
});
