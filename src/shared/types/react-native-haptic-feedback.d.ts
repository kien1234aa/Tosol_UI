declare module 'react-native-haptic-feedback' {
  export type HapticFeedbackTypes =
    | 'selection'
    | 'impactLight'
    | 'impactMedium'
    | 'impactHeavy'
    | 'notificationSuccess'
    | 'notificationWarning'
    | 'notificationError'
    | 'keyboardTap';

  export interface HapticOptions {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
  }

  const ReactNativeHapticFeedback: {
    trigger(type: HapticFeedbackTypes, options?: HapticOptions): void;
  };

  export default ReactNativeHapticFeedback;
}
