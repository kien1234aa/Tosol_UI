import { Alert } from 'react-native';
import { featureInDevelopmentCopy } from '@/src/configs/app';

export function showFeatureInDevelopmentAlert(
  message: string = featureInDevelopmentCopy.message,
): void {
  Alert.alert(featureInDevelopmentCopy.title, message);
}
