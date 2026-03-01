import { useCallback, useState } from "react";

interface UseControlledValueProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

/**
 * 管理受控/非受控模式的值
 * 自动判断组件是受控还是非受控，并提供统一的接口
 */
export function useControlledValue({
  value,
  defaultValue = "",
  onChange,
}: UseControlledValueProps): [string, (newValue: string) => void] {
  // 判断是否为受控模式
  const isControlled = value !== undefined;

  // 内部状态（仅用于非受控模式）
  const [internalValue, setInternalValue] = useState(defaultValue);

  // 实际使用的值
  const currentValue = isControlled ? value : internalValue;

  // 值变更处理
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return [currentValue, handleValueChange];
}
