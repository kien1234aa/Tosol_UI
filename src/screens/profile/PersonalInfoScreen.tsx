import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { personalInfoCopy } from '@/src/configs/profile';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
} from '@/src/configs/theme/buttonLayout';
import {
  PersonalInfoAvatar,
  PersonalInfoField,
  ProfileStackHeader,
} from '@/src/components/profile';
import { usePersonalInfo } from '@/src/hooks/profile';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { fetchCurrentUserThunk } from '@/src/redux/login';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { Box } from '@/src/uikits/box';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type PersonalInfoScreenProps = ProfileStackScreenProps<'PersonalInfo'>;

export function PersonalInfoScreen({ navigation }: PersonalInfoScreenProps) {
  const dispatch = useAppDispatch();
  const { values, errors, onChangeField, onSave } = usePersonalInfo();

  useEffect(() => {
    void dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  const handleBack = useStackGoBack(navigation, 'ProfileMain');

  const handleSave = useCallback(() => {
    const didSave = onSave();
    if (!didSave) {
      return;
    }

    Alert.alert(personalInfoCopy.saveSuccess, undefined, [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation, onSave]);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProfileStackHeader onPressBack={handleBack} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}>
            <VStack className="w-full" space="lg">
              <PersonalInfoAvatar />

              <Box style={styles.formCard}>
                <VStack space="md">
                  <PersonalInfoField
                    label={personalInfoCopy.fullNameLabel}
                    placeholder={personalInfoCopy.fullNamePlaceholder}
                    value={values.fullName}
                    onChangeText={value => onChangeField('fullName', value)}
                    error={errors.fullName}
                  />
                  <PersonalInfoField
                    label={personalInfoCopy.usernameLabel}
                    placeholder={personalInfoCopy.usernameLabel}
                    value={values.username}
                    onChangeText={() => {}}
                    readOnly
                  />
                  <PersonalInfoField
                    label={personalInfoCopy.emailLabel}
                    placeholder={personalInfoCopy.emailPlaceholder}
                    value={values.email}
                    onChangeText={value => onChangeField('email', value)}
                    error={errors.email}
                    keyboardType="email-address"
                  />
                  <PersonalInfoField
                    label={personalInfoCopy.phoneLabel}
                    placeholder={personalInfoCopy.phonePlaceholder}
                    value={values.phone}
                    onChangeText={value => onChangeField('phone', value)}
                    error={errors.phone}
                    keyboardType="phone-pad"
                  />
                  <PersonalInfoField
                    label={personalInfoCopy.addressLabel}
                    placeholder={personalInfoCopy.addressPlaceholder}
                    value={values.address}
                    onChangeText={value => onChangeField('address', value)}
                    error={errors.address}
                    multiline
                  />
                </VStack>
              </Box>
            </VStack>
          </ScrollView>

          <Box style={styles.footer}>
            <Pressable
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel={personalInfoCopy.save}
              style={[buttonPrimaryCta, styles.saveButton]}>
              <Text
                size="md"
                className="font-semibold text-typography-0"
                style={buttonLabelStyle}>
                {personalInfoCopy.save}
              </Text>
            </Pressable>
          </Box>
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
  saveButton: {
    backgroundColor: lightTokens.tertiary500,
  },
});
