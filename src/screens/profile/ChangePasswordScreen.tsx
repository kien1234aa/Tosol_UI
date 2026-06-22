import React, { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { changePasswordCopy } from '@/src/configs/profile';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
} from '@/src/configs/theme/buttonLayout';
import {
  ChangePasswordField,
  ProfileStackHeader,
  type ChangePasswordFieldRef,
} from '@/src/components/profile';
import { useChangePassword } from '@/src/hooks/profile';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectIsAdminUser } from '@/src/redux/login';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { DismissKeyboardView } from '@/src/shared/components/ui/DismissKeyboardView';
import { FormKeyboardAvoidingView } from '@/src/shared/components/ui/FormKeyboardAvoidingView';
import { focusInputRef } from '@/src/shared/utils/focusInputRef';
import { Box } from '@/src/uikits/box';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ChangePasswordScreenProps = ProfileStackScreenProps<'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const blockFeature = useFeatureInDevelopmentNotice();
  const isAdmin = useAppSelector(selectIsAdminUser);
  const newPasswordRef = useRef<ChangePasswordFieldRef>(null);
  const confirmPasswordRef = useRef<ChangePasswordFieldRef>(null);
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    errors,
    serverError,
    isSubmitting,
    onChangeCurrentPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
    onToggleShowCurrentPassword,
    onToggleShowNewPassword,
    onToggleShowConfirmPassword,
  } = useChangePassword();

  const handleBack = useStackGoBack(navigation, 'ProfileMain');

  useEffect(() => {
    if (!isAdmin) {
      navigation.goBack();
    }
  }, [isAdmin, navigation]);

  const handleSubmit = useCallback(async () => {
    blockFeature();
  }, [blockFeature]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ProfileStackHeader
          title={changePasswordCopy.screenTitle}
          onPressBack={handleBack}
        />

        <FormKeyboardAvoidingView>
          <VStack className="flex-1">
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.content}>
              <DismissKeyboardView>
                <VStack className="w-full" space="lg">
                  <Text size="sm" className="text-typography-600">
                    {changePasswordCopy.subtitle}
                  </Text>

                  <Box style={styles.formCard}>
                    <VStack space="md">
                      <ChangePasswordField
                        label={changePasswordCopy.currentPasswordLabel}
                        placeholder={changePasswordCopy.currentPasswordPlaceholder}
                        value={currentPassword}
                        onChangeText={onChangeCurrentPassword}
                        error={errors.currentPassword}
                        showPassword={showCurrentPassword}
                        onToggleShowPassword={onToggleShowCurrentPassword}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => focusInputRef(newPasswordRef)}
                        testID="change-password-current-input"
                      />
                      <ChangePasswordField
                        ref={newPasswordRef}
                        label={changePasswordCopy.newPasswordLabel}
                        placeholder={changePasswordCopy.newPasswordPlaceholder}
                        value={newPassword}
                        onChangeText={onChangeNewPassword}
                        error={errors.newPassword}
                        showPassword={showNewPassword}
                        onToggleShowPassword={onToggleShowNewPassword}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => focusInputRef(confirmPasswordRef)}
                        testID="change-password-new-input"
                      />
                      <ChangePasswordField
                        ref={confirmPasswordRef}
                        label={changePasswordCopy.confirmPasswordLabel}
                        placeholder={changePasswordCopy.confirmPasswordPlaceholder}
                        value={confirmPassword}
                        onChangeText={onChangeConfirmPassword}
                        error={errors.confirmPassword}
                        showPassword={showConfirmPassword}
                        onToggleShowPassword={onToggleShowConfirmPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                        testID="change-password-confirm-input"
                      />

                      {serverError ? (
                        <Text size="sm" className="text-error-500">
                          {serverError}
                        </Text>
                      ) : null}
                    </VStack>
                  </Box>
                </VStack>
              </DismissKeyboardView>
            </ScrollView>

            <Box style={styles.footer}>
              <Pressable
                onPress={handleSubmit}
                accessibilityRole="button"
                accessibilityLabel={changePasswordCopy.submit}
                disabled={isSubmitting}
                style={[
                  buttonPrimaryCta,
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}>
                {isSubmitting ? (
                  <ActivityIndicator color={lightTokens.typography0} />
                ) : (
                  <Text
                    size="md"
                    className="font-semibold text-typography-0"
                    style={buttonLabelStyle}>
                    {changePasswordCopy.submit}
                  </Text>
                )}
              </Pressable>
            </Box>
          </VStack>
        </FormKeyboardAvoidingView>
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  formCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
    backgroundColor: lightTokens.background0,
    borderTopWidth: 1,
    borderTopColor: lightTokens.outline100,
  },
  submitButton: {
    backgroundColor: lightTokens.tertiary500,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});
