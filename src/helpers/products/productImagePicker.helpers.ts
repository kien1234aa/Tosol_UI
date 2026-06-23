import {
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import { productsCopy } from '@/src/configs/products';
import { isCameraBlockedByEnvironment } from '@/src/helpers/app';
import type { CreateProductImagePart } from '@/src/types/products';

export type ProductImagePickResult = {
  image: CreateProductImagePart | null;
  error: string | null;
  cameraUnavailable: boolean;
};

function mapAssetToImagePart(asset: Asset): CreateProductImagePart | null {
  if (!asset.uri) {
    return null;
  }

  return {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? `product_${Date.now()}.jpg`,
  };
}

async function ensureAndroidCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function mapImagePickerError(result: ImagePickerResponse): {
  error: string;
  cameraUnavailable: boolean;
} {
  if (result.errorCode === 'camera_unavailable') {
    return {
      error: productsCopy.simulatorCameraUnavailable,
      cameraUnavailable: true,
    };
  }

  if (result.errorCode === 'permission') {
    return {
      error: productsCopy.cameraPermissionDenied,
      cameraUnavailable: false,
    };
  }

  return {
    error: result.errorMessage ?? productsCopy.imagePickerError,
    cameraUnavailable: false,
  };
}

export async function pickProductImageFromLibrary(): Promise<ProductImagePickResult> {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (result.didCancel) {
      return { image: null, error: null, cameraUnavailable: false };
    }

    if (result.errorCode || result.errorMessage) {
      const mapped = mapImagePickerError(result);
      return {
        image: null,
        error: mapped.error,
        cameraUnavailable: mapped.cameraUnavailable,
      };
    }

    const asset = result.assets?.[0];
    const image = asset ? mapAssetToImagePart(asset) : null;
    return {
      image,
      error: image ? null : productsCopy.imagePickerError,
      cameraUnavailable: false,
    };
  } catch (error) {
    return {
      image: null,
      error:
        error instanceof Error ? error.message : productsCopy.imagePickerError,
      cameraUnavailable: false,
    };
  }
}

export async function pickProductImageFromCamera(): Promise<ProductImagePickResult> {
  try {
    if (isCameraBlockedByEnvironment()) {
      return {
        image: null,
        error: productsCopy.simulatorCameraUnavailable,
        cameraUnavailable: true,
      };
    }

    const hasPermission = await ensureAndroidCameraPermission();
    if (!hasPermission) {
      return {
        image: null,
        error: productsCopy.cameraPermissionDenied,
        cameraUnavailable: false,
      };
    }

    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
      cameraType: 'back',
    });

    if (result.didCancel) {
      return { image: null, error: null, cameraUnavailable: false };
    }

    if (result.errorCode || result.errorMessage) {
      const mapped = mapImagePickerError(result);
      return {
        image: null,
        error: mapped.error,
        cameraUnavailable: mapped.cameraUnavailable,
      };
    }

    const asset = result.assets?.[0];
    const image = asset ? mapAssetToImagePart(asset) : null;
    return {
      image,
      error: image ? null : productsCopy.cameraError,
      cameraUnavailable: false,
    };
  } catch (error) {
    return {
      image: null,
      error: error instanceof Error ? error.message : productsCopy.cameraError,
      cameraUnavailable: false,
    };
  }
}
