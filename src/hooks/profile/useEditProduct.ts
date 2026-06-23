import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { productsService } from '@/src/apis/products';
import { productsCopy } from '@/src/configs/products';
import {
  createEmptyCreateProductFormValues,
  getProductDetailHeroImageUrl,
  isCreateProductFormValid,
  mapProductDetailApiToFormValues,
  mapProductDetailApiToProfileDetail,
  pickProductImageFromCamera,
  pickProductImageFromLibrary,
  toUpdateProductPayload,
  validateEditProductForm,
} from '@/src/helpers/products';
import type {
  CreateProductFormValues,
  CreateProductImagePart,
  CreateProductValidationErrors,
  ProductApiItem,
} from '@/src/types/products';

export interface UseEditProductResult {
  values: CreateProductFormValues;
  existingImageUrl: string | null;
  pickedImage: CreateProductImagePart | null;
  errors: CreateProductValidationErrors;
  isLoading: boolean;
  isSubmitting: boolean;
  loadError: string | null;
  submitError: string | null;
  onChangeField: <K extends keyof CreateProductFormValues>(
    field: K,
    value: CreateProductFormValues[K],
  ) => void;
  onPickFromLibrary: () => Promise<void>;
  onPickFromCamera: () => Promise<void>;
  onRemoveImage: () => void;
  onSubmit: () => Promise<ProductApiItem | null>;
  reload: () => Promise<void>;
}

export function useEditProduct(productId: string): UseEditProductResult {
  const [values, setValues] = useState<CreateProductFormValues | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<CreateProductImagePart | null>(
    null,
  );
  const [errors, setErrors] = useState<CreateProductValidationErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setLoadError(null);

    try {
      const data = await productsService.getById(productId);
      setValues(mapProductDetailApiToFormValues(data));
      setExistingImageUrl(
        getProductDetailHeroImageUrl(mapProductDetailApiToProfileDetail(data)),
      );
      setPickedImage(null);
    } catch (error) {
      setValues(null);
      setExistingImageUrl(null);
      setLoadError(
        error instanceof Error ? error.message : productsCopy.editLoadError,
      );
    }
  }, [productId]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadProduct();
    } finally {
      setIsLoading(false);
    }
  }, [loadProduct]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onChangeField = useCallback(
    <K extends keyof CreateProductFormValues>(
      field: K,
      value: CreateProductFormValues[K],
    ) => {
      setValues(current => (current ? { ...current, [field]: value } : current));
      setErrors(current => {
        if (!current[field as keyof CreateProductValidationErrors]) {
          return current;
        }

        const next = { ...current };
        delete next[field as keyof CreateProductValidationErrors];
        return next;
      });
      setSubmitError(null);
    },
    [],
  );

  const onPickFromLibrary = useCallback(async () => {
    const { image, error } = await pickProductImageFromLibrary();
    if (error) {
      Alert.alert(productsCopy.editScreenTitle, error);
      return;
    }
    if (image) {
      setPickedImage(image);
      setSubmitError(null);
    }
  }, []);

  const onPickFromCamera = useCallback(async () => {
    const { image, error } = await pickProductImageFromCamera();
    if (error) {
      Alert.alert(productsCopy.editScreenTitle, error);
      return;
    }
    if (image) {
      setPickedImage(image);
      setSubmitError(null);
    }
  }, []);

  const onRemoveImage = useCallback(() => {
    setPickedImage(null);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!values) {
      return null;
    }

    const nextErrors = validateEditProductForm(values);
    setErrors(nextErrors);

    if (!isCreateProductFormValid(nextErrors)) {
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = toUpdateProductPayload(values);
      const updated = pickedImage
        ? await productsService.updateWithImage(productId, payload, pickedImage)
        : await productsService.update(productId, payload);
      setPickedImage(null);
      setExistingImageUrl(
        updated.thumbnail_url ?? updated.image_url ?? existingImageUrl,
      );
      return updated;
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : productsCopy.editError,
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [existingImageUrl, pickedImage, productId, values]);

  return {
    values: values ?? createEmptyCreateProductFormValues(),
    existingImageUrl,
    pickedImage,
    errors,
    isLoading,
    isSubmitting,
    loadError,
    submitError,
    onChangeField,
    onPickFromLibrary,
    onPickFromCamera,
    onRemoveImage,
    onSubmit,
    reload,
  };
}
