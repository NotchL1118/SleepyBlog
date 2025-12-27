import { useState, useCallback, useRef } from "react";
import { z } from "zod";

type FormErrors<T> = { [K in keyof T]?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodObjectSchema = z.ZodObject<any>;

interface UseFormOptions<T extends ZodObjectSchema> {
  schema: T;
  initialValues: z.infer<T>;
}

interface UseFormReturn<T extends ZodObjectSchema> {
  values: z.infer<T>;
  errors: FormErrors<z.infer<T>>;

  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  setFieldValue: <K extends keyof z.infer<T>>(field: K, value: z.infer<T>[K]) => void;
  setValues: (values: Partial<z.infer<T>>) => void;
  setFieldError: <K extends keyof z.infer<T>>(field: K, error: string | undefined) => void;
  clearFieldError: <K extends keyof z.infer<T>>(field: K) => void;

  validate: () => boolean;
  validateField: <K extends keyof z.infer<T>>(field: K) => string | undefined;
  reset: (values?: z.infer<T>) => void;
}

export function useForm<T extends ZodObjectSchema>({
  schema,
  initialValues,
}: UseFormOptions<T>): UseFormReturn<T> {
  type FormValues = z.infer<T>;

  // 使用 ref 存储 initialValues，避免 reset 依赖变化导致无限循环
  const initialValuesRef = useRef<FormValues>(initialValues);

  const [values, setValuesState] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<FormValues>>({});

  // 更新单个字段值，自动清除该字段的错误
  const setFieldValue = useCallback(<K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  // 批量更新值
  const setValues = useCallback((newValues: Partial<FormValues>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
    // 清除被更新字段的错误
    const fieldsToUpdate = Object.keys(newValues) as (keyof FormValues)[];
    setErrors((prev) => {
      const hasErrorsToClear = fieldsToUpdate.some((field) => prev[field]);
      if (!hasErrorsToClear) return prev;

      const next = { ...prev };
      fieldsToUpdate.forEach((field) => {
        delete next[field];
      });
      return next;
    });
  }, []);

  // 处理输入变化
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFieldValue(name as keyof FormValues, value as FormValues[keyof FormValues]);
    },
    [setFieldValue]
  );

  // 设置单个字段错误
  const setFieldError = useCallback(
    <K extends keyof FormValues>(field: K, error: string | undefined) => {
      setErrors((prev) => {
        if (error === undefined) {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: error };
      });
    },
    []
  );

  // 清除单个字段错误
  const clearFieldError = useCallback(<K extends keyof FormValues>(field: K) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // 验证单个字段
  const validateField = useCallback(
    <K extends keyof FormValues>(field: K): string | undefined => {
      const fieldSchema = schema.shape[field as string] as z.ZodType | undefined;
      if (!fieldSchema) return undefined;

      const result = fieldSchema.safeParse(values[field]);
      if (!result.success) {
        const errorMessage = result.error.issues[0]?.message;
        setFieldError(field, errorMessage);
        return errorMessage;
      }
      setFieldError(field, undefined);
      return undefined;
    },
    [schema, values, setFieldError]
  );

  // 验证所有字段
  const validate = useCallback((): boolean => {
    const result = schema.safeParse(values);

    if (!result.success) {
      const newErrors: FormErrors<FormValues> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormValues;
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [schema, values]);

  // 重置表单 - 使用 ref 保证引用稳定
  const reset = useCallback((newValues?: FormValues) => {
    setValuesState(newValues ?? initialValuesRef.current);
    setErrors({});
  }, []);

  return {
    values,
    errors,
    handleChange,
    setFieldValue,
    setValues,
    setFieldError,
    clearFieldError,
    validate,
    validateField,
    reset,
  };
}
