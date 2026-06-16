import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { TextField } from '@shared/components/ui/TextField';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { CheckboxField } from '@shared/components/ui/CheckboxField';
import { Button } from '@shared/components/ui/Button';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { loginContentPaddingX } from '../utils/loginContentPadding';

interface LoginFormProps {
  onLogin?: (email: string, password: string, rememberMe: boolean) => void;
  onForgotPassword?: () => void;
}

const LoginForm = ({ onLogin, onForgotPassword }: LoginFormProps) => {
  const { t } = useTranslation();
  const { width: winW } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const palette = useAppColors();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const fieldVariant = isDark ? 'dark' : 'light';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: loginContentPaddingX(winW),
          paddingBottom: 32,
        },
        field: {
          marginBottom: 14,
        },
      }),
    [winW],
  );

  const fieldIconColor = palette.textMuted;

  const handleLogin = async () => {
    setLoading(true);
    try {
      await onLogin?.(email, password, rememberMe);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextField
        variant={fieldVariant}
        size="lg"
        borderless
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        placeholder={t('auth.emailPlaceholder')}
        startIcon={
          <SystemIcon name="mail" size={20} color={fieldIconColor} />
        }
        containerStyle={styles.field}
      />

      <TextField
        variant={fieldVariant}
        size="lg"
        borderless
        value={password}
        onChangeText={setPassword}
        isPassword
        passwordToggleVariant="icon"
        showPasswordLabel={t('auth.showPassword')}
        hidePasswordLabel={t('auth.hidePassword')}
        placeholder={t('auth.passwordPlaceholder')}
        startIcon={
          <SystemIcon name="lock" size={20} color={fieldIconColor} />
        }
        containerStyle={styles.field}
      />

      <CheckboxField
        label={t('auth.rememberMe')}
        variant={fieldVariant}
        checked={rememberMe}
        onChange={setRememberMe}
        endAction={
          onForgotPassword
            ? { label: t('auth.forgotPassword'), onPress: onForgotPassword }
            : undefined
        }
      />

      <Button
        title={t('auth.signIn')}
        variant="primary"
        size="md"
        onPress={handleLogin}
        loading={loading}
      />
    </View>
  );
};

export default LoginForm;
