import React, { memo } from 'react';
import { personalInfoCopy } from '@/src/configs/profile';
import { StackHeader } from '@/src/components/main';

interface ProfileStackHeaderProps {
  title?: string;
  onPressBack: () => void;
}

function ProfileStackHeaderComponent({
  title = personalInfoCopy.screenTitle,
  onPressBack,
}: ProfileStackHeaderProps) {
  return (
    <StackHeader
      title={title}
      onPressBack={onPressBack}
      backAccessibilityLabel={personalInfoCopy.back}
    />
  );
}

export const ProfileStackHeader = memo(ProfileStackHeaderComponent);
