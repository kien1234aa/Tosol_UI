import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { productsService } from '@/src/apis/products';
import { productsCopy } from '@/src/configs/products';
import {
  applySuggestionToComboRow,
  createEmptyComboRow,
  createEmptyCreateProductFormValues,
  isCreateProductFormValid,
  pickProductImageFromCamera,
  pickProductImageFromLibrary,
  toCreateProductPayload,
  validateCreateProductForm,
} from '@/src/helpers/products';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectAuthSellerId } from '@/src/redux/login';
import type {
  CreateProductComboRow,
  CreateProductFormValues,
  CreateProductImagePart,
  CreateProductValidationErrors,
  ProductApiItem,
  ProductSuggestionItem,
} from '@/src/types/products';

export interface UseCreateProductResult {
  values: CreateProductFormValues;
  comboRows: CreateProductComboRow[];
  pickedImage: CreateProductImagePart | null;
  errors: CreateProductValidationErrors;
  isSubmitting: boolean;
  submitError: string | null;
  onChangeField: <K extends keyof CreateProductFormValues>(
    field: K,
    value: CreateProductFormValues[K],
  ) => void;
  onAddComboRow: () => void;
  onRemoveComboRow: (rowId: string) => void;
  onSelectComboRowProduct: (
    rowId: string,
    product: ProductSuggestionItem,
  ) => void;
  onChangeComboRowQuantity: (rowId: string, quantity: string) => void;
  onPickFromLibrary: () => Promise<void>;
  onPickFromCamera: () => Promise<void>;
  onRemoveImage: () => void;
  onSubmit: () => Promise<ProductApiItem | null>;
}

export function useCreateProduct(): UseCreateProductResult {
  const sellerId = useAppSelector(selectAuthSellerId);
  const [values, setValues] = useState<CreateProductFormValues>(
    createEmptyCreateProductFormValues,
  );
  const [comboRows, setComboRows] = useState<CreateProductComboRow[]>([]);
  const [pickedImage, setPickedImage] = useState<CreateProductImagePart | null>(
    null,
  );
  const [errors, setErrors] = useState<CreateProductValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onChangeField = useCallback(
    <K extends keyof CreateProductFormValues>(
      field: K,
      value: CreateProductFormValues[K],
    ) => {
      setValues(current => ({ ...current, [field]: value }));
      if (field === 'isCombo') {
        if (value) {
          setComboRows(current =>
            current.length > 0 ? current : [createEmptyComboRow()],
          );
        } else {
          setComboRows([]);
        }
      }
      setErrors(current => {
        const next = { ...current };
        if (field === 'isCombo' && next.comboItems) {
          delete next.comboItems;
        }
        if (current[field as keyof CreateProductValidationErrors]) {
          delete next[field as keyof CreateProductValidationErrors];
        }
        return next;
      });
      setSubmitError(null);
    },
    [],
  );

  const onAddComboRow = useCallback(() => {
    setComboRows(current => [...current, createEmptyComboRow()]);
    setErrors(current => {
      if (!current.comboItems) {
        return current;
      }
      const next = { ...current };
      delete next.comboItems;
      return next;
    });
    setSubmitError(null);
  }, []);

  const onRemoveComboRow = useCallback((rowId: string) => {
    setComboRows(current => {
      const next = current.filter(row => row.rowId !== rowId);
      return next.length > 0 ? next : [createEmptyComboRow()];
    });
    setSubmitError(null);
  }, []);

  const onSelectComboRowProduct = useCallback(
    (rowId: string, product: ProductSuggestionItem) => {
      setComboRows(current =>
        current.map(row =>
          row.rowId === rowId ? applySuggestionToComboRow(row, product) : row,
        ),
      );
      setErrors(current => {
        if (!current.comboItems) {
          return current;
        }
        const next = { ...current };
        delete next.comboItems;
        return next;
      });
      setSubmitError(null);
    },
    [],
  );

  const onChangeComboRowQuantity = useCallback(
    (rowId: string, quantity: string) => {
      setComboRows(current =>
        current.map(row =>
          row.rowId === rowId ? { ...row, quantity } : row,
        ),
      );
      setSubmitError(null);
    },
    [],
  );

  const onPickFromLibrary = useCallback(async () => {
    const { image, error } = await pickProductImageFromLibrary();
    if (error) {
      Alert.alert(productsCopy.createScreenTitle, error);
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
      Alert.alert(productsCopy.createScreenTitle, error);
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
    const nextErrors = validateCreateProductForm(values, comboRows);
    setErrors(nextErrors);

    if (!isCreateProductFormValid(nextErrors)) {
      return null;
    }

    if (sellerId == null) {
      setSubmitError(productsCopy.sellerRequired);
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = toCreateProductPayload(values, sellerId, comboRows);
      const created = pickedImage
        ? await productsService.createWithImage(payload, pickedImage)
        : await productsService.create(payload);
      setValues(createEmptyCreateProductFormValues());
      setComboRows([]);
      setPickedImage(null);
      setErrors({});
      return created;
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : productsCopy.createError,
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [comboRows, pickedImage, sellerId, values]);

  return {
    values,
    comboRows,
    pickedImage,
    errors,
    isSubmitting,
    submitError,
    onChangeField,
    onAddComboRow,
    onRemoveComboRow,
    onSelectComboRowProduct,
    onChangeComboRowQuantity,
    onPickFromLibrary,
    onPickFromCamera,
    onRemoveImage,
    onSubmit,
  };
}
