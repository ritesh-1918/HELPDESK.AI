import { useMemo } from 'react';
import PickerButton from '../PickerButton';
export default function useComponents(components) {
  return useMemo(() => ({
    button: PickerButton,
    ...components
  }), [components]);
}