import React, { memo } from 'react';
import { StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/src/uikits/form-control';
import { Input, InputField } from '@/src/uikits/input';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface PersonalInfoFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  readOnly?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}

function PersonalInfoFieldComponent({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  readOnly = false,
  keyboardType,
  multiline = false,
}: PersonalInfoFieldProps) {
  const isInvalid = Boolean(error);

  return (
    <FormControl isInvalid={isInvalid} className="w-full">
      <VStack space="xs">
        <Text size="sm" className="font-medium text-typography-700">
          {label}
        </Text>
        <Input
          variant="outline"
          size="md"
          isReadOnly={readOnly}
          isDisabled={readOnly}
          isInvalid={isInvalid}
          className="min-h-11 rounded-xl border border-outline-200 bg-background-0 data-[focus=true]:border-tertiary-500">
          <InputField
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            editable={!readOnly}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
            placeholderTextColor={lightTokens.typography500}
            className={
              multiline
                ? 'py-3 text-typography-900'
                : 'text-typography-900'
            }
            style={readOnly ? styles.readOnlyField : undefined}
          />
        </Input>
      </VStack>

      {isInvalid ? (
        <FormControlError className="mt-1">
          <FormControlErrorText className="text-error-500">
            {error}
          </FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
}

const styles = StyleSheet.create({
  readOnlyField: {
    color: lightTokens.typography500,
  },
});

export const PersonalInfoField = memo(PersonalInfoFieldComponent);
