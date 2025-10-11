/**
 * useForm Hook
 * 
 * A comprehensive form state management hook with validation.
 * Handles form values, errors, touched fields, and submission.
 */

import { useState, useCallback, FormEvent } from 'react';

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule[];
};

export interface UseFormConfig<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema = {},
  onSubmit,
  validateOnBlur = true,
  validateOnChange = false,
}: UseFormConfig<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is dirty
  const isDirty = Object.keys(values).some(
    (key) => values[key] !== initialValues[key]
  );

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T): boolean => {
      const rules = validationSchema[field];
      if (!rules || rules.length === 0) return true;

      const value = values[field];

      for (const rule of rules) {
        switch (rule.type) {
          case 'required':
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            break;

          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            break;

          case 'min':
            if (typeof value === 'string' && value.length < rule.value) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            if (typeof value === 'number' && value < rule.value) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            break;

          case 'max':
            if (typeof value === 'string' && value.length > rule.value) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            if (typeof value === 'number' && value > rule.value) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            break;

          case 'pattern':
            if (value && !rule.value.test(value)) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            break;

          case 'custom':
            if (rule.validator && !rule.validator(value)) {
              setErrors((prev) => ({ ...prev, [field]: rule.message }));
              return false;
            }
            break;
        }
      }

      // Clear error if validation passed
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      return true;
    },
    [values, validationSchema]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let isFormValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const fieldKey = field as keyof T;
      if (!validateField(fieldKey)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [validateField, validationSchema]);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        validateField(field);
      }
    },
    [validateOnChange, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      );
      setTouched(allTouched);

      // Validate form
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateField,
    validateForm,
  };
};

export default useForm;
