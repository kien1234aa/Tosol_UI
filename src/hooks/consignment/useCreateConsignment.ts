import { useCallback, useRef, useState } from 'react';
import { consignmentCopy, consignmentLimits } from '@/src/configs/consignment';
import type {
  ConsignmentErrors,
  ConsignmentPackageDraft,
} from '@/src/types/consignment/consignment.types';

type EditablePackageField = 'trackingCode' | 'productName' | 'note';

export interface UseCreateConsignmentResult {
  packages: ConsignmentPackageDraft[];
  errors: ConsignmentErrors;
  canAddPackage: boolean;
  canRemovePackage: boolean;
  onAddPackage: () => void;
  onRemovePackage: (id: string) => void;
  onChangeField: (
    id: string,
    field: EditablePackageField,
    value: string,
  ) => void;
  onSubmit: (onValid: () => void) => void;
  reset: () => void;
}

function createEmptyPackage(id: string): ConsignmentPackageDraft {
  return { id, trackingCode: '', productName: '', note: '' };
}

export function useCreateConsignment(): UseCreateConsignmentResult {
  const idCounter = useRef(1);
  const [packages, setPackages] = useState<ConsignmentPackageDraft[]>(() => [
    createEmptyPackage('pkg-1'),
  ]);
  const [errors, setErrors] = useState<ConsignmentErrors>({});

  const canAddPackage = packages.length < consignmentLimits.maxPackages;
  const canRemovePackage = packages.length > 1;

  const onAddPackage = useCallback(() => {
    setPackages(prev => {
      if (prev.length >= consignmentLimits.maxPackages) {
        return prev;
      }
      idCounter.current += 1;
      return [...prev, createEmptyPackage(`pkg-${idCounter.current}`)];
    });
  }, []);

  const onRemovePackage = useCallback((id: string) => {
    setPackages(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter(item => item.id !== id);
    });
    setErrors(prev => {
      if (!prev[id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const onChangeField = useCallback(
    (id: string, field: EditablePackageField, value: string) => {
      setPackages(prev =>
        prev.map(item =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
      if (field === 'note') {
        return;
      }
      setErrors(prev => {
        const current = prev[id];
        if (!current || !current[field]) {
          return prev;
        }
        const nextForId = { ...current };
        delete nextForId[field];
        return { ...prev, [id]: nextForId };
      });
    },
    [],
  );

  const onSubmit = useCallback(
    (onValid: () => void) => {
      const nextErrors: ConsignmentErrors = {};

      packages.forEach(item => {
        const packageErrors: ConsignmentErrors[string] = {};
        if (!item.trackingCode.trim()) {
          packageErrors.trackingCode = consignmentCopy.requiredTrackingCode;
        }
        if (!item.productName.trim()) {
          packageErrors.productName = consignmentCopy.requiredProductName;
        }
        if (Object.keys(packageErrors).length > 0) {
          nextErrors[item.id] = packageErrors;
        }
      });

      setErrors(nextErrors);

      if (Object.keys(nextErrors).length === 0) {
        onValid();
      }
    },
    [packages],
  );

  const reset = useCallback(() => {
    idCounter.current = 1;
    setPackages([createEmptyPackage('pkg-1')]);
    setErrors({});
  }, []);

  return {
    packages,
    errors,
    canAddPackage,
    canRemovePackage,
    onAddPackage,
    onRemovePackage,
    onChangeField,
    onSubmit,
    reset,
  };
}
