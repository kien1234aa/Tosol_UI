import React, { memo } from 'react';
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from '@/src/uikits/checkbox';
import { CheckIcon } from '@/src/uikits/icon';

interface RememberMeCheckboxProps {
  label: string;
  isChecked: boolean;
  onChange: (value: boolean) => void;
}

function RememberMeCheckboxComponent({
  label,
  isChecked,
  onChange,
}: RememberMeCheckboxProps) {
  return (
    <Checkbox
      value="remember"
      size="md"
      isChecked={isChecked}
      onChange={onChange}
      accessibilityLabel={label}>
      <CheckboxIndicator className="rounded-md border-outline-400">
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
      <CheckboxLabel className="text-typography-900">{label}</CheckboxLabel>
    </Checkbox>
  );
}

export const RememberMeCheckbox = memo(RememberMeCheckboxComponent);
